// src/pages/JournalingPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchJournalPosts,
  likeJournalPost,
  commentOnJournalPost,
  createJournalPost,
} from "../../redux/slices/journalSlice";

import PostCreationForm from "../../components/journaling/PostCreationForm";
import JournalPostCard from "../../components/journaling/JournalPostCard";

const JournalingPage = () => {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state) => state.journal);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('posts'); 

  useEffect(() => {
    if (activeTab === 'posts') {
        dispatch(fetchJournalPosts());
    }
  }, [dispatch, activeTab]);

  const handleLike = (postId) => {
    dispatch(likeJournalPost(postId));
  };

  const handleCommentSubmit = (postId, text) => {
    if (text.trim()) {
      dispatch(commentOnJournalPost({ postId, text }));
    }
  };

  const handlePostCreation = (postData) => {
    dispatch(createJournalPost(postData));
    setActiveTab('posts');
  };

  const TabButton = ({ name, label }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`px-4 py-2 font-semibold transition-colors duration-200 
        ${activeTab === name
          ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
          : 'text-gray-500 hover:text-indigo-600'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
        Community Journal
      </h1>

      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <TabButton name="posts" label="Posts" />
        <TabButton name="upload" label="Create Post" />
      </div>

      <div className="w-full">
        {activeTab === 'upload' && (
          <PostCreationForm onSubmit={handlePostCreation} />
        )}

        {activeTab === 'posts' && (
          <>
            {loading && <div className="text-center text-gray-500">Loading posts...</div>}
            
            {/* Desktop/Tablet-style grid layout */}
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {posts.length === 0 && !loading ? (
                <div className="col-span-full text-center text-gray-500 py-10 bg-white dark:bg-gray-700 rounded-lg shadow-md">
                  No posts yet. Be the first to share your feelings!
                </div>
              ) : (
                posts.map((post) => (
                  <JournalPostCard
                    key={post._id}
                    post={post}
                    currentUser={user}
                    handleLike={handleLike}
                    handleCommentSubmit={handleCommentSubmit}
                  />
                ))
              )}
            </div>

            {/* Mobile/Reels-style vertical swiping layout */}
            {/* The main changes are here: enforcing h-screen for the container */}
            <div className="md:hidden w-full h-full">
              <div className="flex flex-col h-screen overflow-y-auto snap-y snap-mandatory">
                {posts.length === 0 && !loading ? (
                  <div className="h-full flex-shrink-0 flex items-center justify-center snap-start">
                    <div className="w-full text-center text-gray-500 py-10 bg-white dark:bg-gray-700 rounded-lg shadow-md">
                      No posts yet. Be the first to share your feelings!
                    </div>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post._id} className="min-h-full flex-shrink-0 flex items-center justify-center p-4 snap-start">
                      <JournalPostCard
                        post={post}
                        currentUser={user}
                        handleLike={handleLike}
                        handleCommentSubmit={handleCommentSubmit}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JournalingPage;