import JournalPost from "../models/journalPostSchema.js";
import User from "../models/userSchema.js";
import mongoose from "mongoose";

// -------------------- CREATE JOURNAL POST --------------------
export const createJournalPost = async (req, res) => {
  try {
    const { content, isAnonymous } = req.body;
    const author = req.user._id;

    if (!content) {
      return res.status(400).json({ success: false, message: "Content is required." });
    }

    const post = await JournalPost.create({
      author,
      content,
      isAnonymous,
    });

    // Populate the post to return a full object
    const populatedPost = await JournalPost.findById(post._id).populate("author", "username profileImage");

    res.status(201).json({ success: true, message: "Post created successfully.", post: populatedPost });
  } catch (error) {
    console.error("Error creating journal post:", error);
    res.status(500).json({ success: false, message: "Server error creating post." });
  }
};

// -------------------- GET ALL JOURNAL POSTS --------------------
export const getJournalPosts = async (req, res) => {
  try {
    const posts = await JournalPost.find()
      .populate("author", "username profileImage")
      .populate("comments.author", "username profileImage")
      .sort({ createdAt: -1 });

    // Remove the conditional check and always return full comment details
    const formattedPosts = posts.map(post => {
      if (post.isAnonymous) {
        return {
          ...post.toObject(),
          author: { _id: post.author._id, username: "Anonymous User", profileImage: null },
        };
      }
      return post;
    });

    res.status(200).json({ success: true, posts: formattedPosts });
  } catch (error) {
    console.error("Error fetching journal posts:", error);
    res.status(500).json({ success: false, message: "Server error fetching posts." });
  }
};
// -------------------- LIKE A JOURNAL POST --------------------
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await JournalPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({ success: true, message: isLiked ? "Post unliked." : "Post liked.", likes: post.likes });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ success: false, message: "Server error liking post." });
  }
};

// -------------------- COMMENT ON A JOURNAL POST --------------------
export const commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const author = req.user._id;

    if (!text) {
      return res.status(400).json({ success: false, message: "Comment text is required." });
    }

    const post = await JournalPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const newComment = { author, text };
    post.comments.push(newComment);
    await post.save();

    // Populate the new comment to return to the frontend
    const populatedPost = await JournalPost.findById(post._id).populate("comments.author", "username profileImage");

    res.status(201).json({ success: true, message: "Comment added.", post: populatedPost });
  } catch (error) {
    console.error("Error commenting on post:", error);
    res.status(500).json({ success: false, message: "Server error commenting on post." });
  }
};

// -------------------- SECURE CHAT CONNECTION --------------------
export const connectToPostAuthor = async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUser = req.user;

    const post = await JournalPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    if (String(post.author) === String(currentUser._id)) {
      return res.status(400).json({ success: false, message: "Cannot chat with yourself." });
    }

    // This part is hypothetical but demonstrates the logic
    // The real-time chat feature would require a separate chat schema and logic
    // For this example, we assume you have a way to create a chat room.
    // We will create a hypothetical chat session without revealing the author's identity to the user.
    const chatRoomId = `journal_chat_${postId}_${currentUser._id}`; // Example of a unique chat room ID

    res.status(200).json({
      success: true,
      message: "Chat connection established. Redirecting to chat room.",
      chatRoomId: chatRoomId,
      partner: post.isAnonymous ? "Anonymous User" : post.author.username,
    });
  } catch (error) {
    console.error("Error connecting to post author:", error);
    res.status(500).json({ success: false, message: "Server error connecting to post author." });
  }
};