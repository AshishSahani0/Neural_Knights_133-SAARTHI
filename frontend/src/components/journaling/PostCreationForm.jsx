// src/components/journaling/PostCreationForm.jsx
import React from "react";
import { useForm } from "react-hook-form";

const PostCreationForm = ({ onSubmit }) => {
  const { register, handleSubmit, reset } = useForm();

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md mb-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <textarea
          {...register("content", { required: true })}
          rows="4"
          placeholder="Share your feelings or thoughts..."
          className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAnonymous"
              {...register("isAnonymous")}
              className="h-4 w-4 text-indigo-600 rounded"
            />
            <label htmlFor="isAnonymous" className="ml-2 text-gray-700 dark:text-gray-300">
              Post anonymously
            </label>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostCreationForm;