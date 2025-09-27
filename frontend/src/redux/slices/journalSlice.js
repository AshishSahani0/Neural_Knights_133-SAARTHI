import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { toast } from "react-toastify";

// -------------------- THUNKS --------------------
export const fetchJournalPosts = createAsyncThunk(
  "journal/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/journal/posts");
      return data.posts;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch posts.");
    }
  }
);

export const createJournalPost = createAsyncThunk(
  "journal/createPost",
  async (postData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/journal/posts", postData);
      toast.success(data.message);
      return data.post;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create post.");
      return rejectWithValue(err.response?.data);
    }
  }
);

export const likeJournalPost = createAsyncThunk(
  "journal/likePost",
  async (postId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/journal/posts/${postId}/like`);
      return { postId, likes: data.likes };
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to like post.");
      return rejectWithValue(err.response?.data);
    }
  }
);

export const commentOnJournalPost = createAsyncThunk(
  "journal/commentOnPost",
  async ({ postId, text }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/journal/posts/${postId}/comment`, { text });
      toast.success(data.message);
      return { postId, post: data.post };
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment.");
      return rejectWithValue(err.response?.data);
    }
  }
);

// -------------------- SLICE --------------------
const journalSlice = createSlice({
  name: "journal",
  initialState: {
    posts: [],
    loading: false,
    error: null,
  },
  reducers: {
    addCommentToState: (state, action) => {
      const { postId, comment } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        post.comments.push(comment);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJournalPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJournalPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchJournalPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch posts.";
      })
      .addCase(createJournalPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(likeJournalPost.fulfilled, (state, action) => {
        const { postId, likes } = action.payload;
        const post = state.posts.find(p => p._id === postId);
        if (post) {
          post.likes = likes;
        }
      })
      .addCase(commentOnJournalPost.fulfilled, (state, action) => {
        const { postId, post: updatedPost } = action.payload;
        const postIndex = state.posts.findIndex(p => p._id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex] = updatedPost;
        }
      });
  },
});

export default journalSlice.reducer;