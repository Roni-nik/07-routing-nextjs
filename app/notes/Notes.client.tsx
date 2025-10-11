
"use client";

import css from "./Notes.client.module.css";
import { useState, useEffect, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { ToastContainer } from "react-toastify";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { fetchNotes } from "../../lib/api";
import { showErrorToast } from "../../components/ShowErrorToast/ShowError";

import NoteList from "../../components/NoteList/NoteList";
import Pagination from "../../components/Pagination/Pagination";
import SearchBox from "../../components/SearchBox/SearchBox";
import Modal from "../../components/Modal/Modal";
import NoteForm from "../../components/NoteForm/NoteForm";

export default function NotesClient() {
  // 🔹 Локальний стан (без пропсів)
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);

  // 🔹 Дебаунс пошуку
  const updateSearchQuery = useDebouncedCallback(
    (value: string) => setSearchQuery(value),
    300
  );

  const handleInputChange = (value: string) => {
    setInputValue(value);
    updateSearchQuery(value);
  };

  // 🔹 Отримання нотаток через React Query
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["notes", searchQuery, currentPage],
    queryFn: () => fetchNotes(searchQuery, currentPage),
    placeholderData: keepPreviousData,
  });

  const totalPages = data?.totalPages || 0;
  const noNotesToastShown = useRef(false);

  // 🔹 Повідомлення про відсутність нотаток
  useEffect(() => {
    if (!isLoading && data && data.notes.length === 0) {
      if (!noNotesToastShown.current) {
        showErrorToast("No notes found for your request.");
        noNotesToastShown.current = true;
      }
    } else {
      noNotesToastShown.current = false;
    }
  }, [data, isLoading]);

  // 🔹 Скидання сторінки при новому пошуку
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox onChange={handleInputChange} value={inputValue} />
        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
        <button onClick={() => setModalOpen(true)} className={css.button}>
          Create note +
        </button>
        {isModalOpen && (
          <Modal onClose={() => setModalOpen(false)}>
            <NoteForm onCancel={() => setModalOpen(false)} />
          </Modal>
        )}
      </header>
      {isSuccess && <NoteList notes={data.notes} />}
      <ToastContainer />
    </div>
  );
}

       