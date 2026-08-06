"use client";

import React, { useState } from "react";
import { Star, X, Sparkles, Send, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";

export interface ReviewData {
  id: string;
  templateId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateTitle: string;
  isDark?: boolean;
  onSubmitReview: (review: ReviewData) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  templateId,
  templateTitle,
  isDark = false,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userName, setUserName] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a review title");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please enter your review feedback");
      return;
    }

    setIsSubmitting(true);

    const newReview: ReviewData = {
      id: `rev-${Date.now()}`,
      templateId,
      userName: userName.trim(),
      userAvatar: userName.trim().charAt(0).toUpperCase(),
      rating,
      title: title.trim(),
      comment: comment.trim(),
      createdAt: "Just now",
    };

    setTimeout(() => {
      onSubmitReview(newReview);
      toast.success("Thank you for your review! ⭐");
      setIsSubmitting(false);
      onClose();
      // Reset form
      setRating(5);
      setUserName("");
      setTitle("");
      setComment("");
    }, 400);
  };

  const currentDisplayRating = hoverRating || rating;

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5:
        return "Outstanding! Loved it";
      case 4:
        return "Very Good & Useful";
      case 3:
        return "Average / It's OK";
      case 2:
        return "Needs Improvement";
      case 1:
        return "Poor / Disappointed";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all transform scale-100 ${
          isDark
            ? "bg-[#18181b] border-neutral-800 text-neutral-100"
            : "bg-white border-neutral-200 text-neutral-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-x-2.5">
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Leave a Review</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {templateTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 5 Star Interactive Picker */}
          <div className="flex flex-col items-center justify-center py-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/20">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
              Select Rating
            </span>
            <div className="flex items-center gap-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= currentDisplayRating
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]"
                        : "text-neutral-300 dark:text-neutral-700"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-2 h-4">
              {getRatingLabel(currentDisplayRating)}
            </span>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Johnson"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors ${
                isDark
                  ? "bg-neutral-900 border-neutral-800 text-white focus:border-amber-500"
                  : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-amber-500"
              }`}
            />
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Review Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Amazing template for team sprint tracking!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors ${
                isDark
                  ? "bg-neutral-900 border-neutral-800 text-white focus:border-amber-500"
                  : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-amber-500"
              }`}
            />
          </div>

          {/* Comment Field */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Review Details <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="What did you like or dislike about this template?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors resize-none ${
                isDark
                  ? "bg-neutral-900 border-neutral-800 text-white focus:border-amber-500"
                  : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-amber-500"
              }`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-x-3 pt-2 border-t border-neutral-200/80 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold transition-all shadow-md flex items-center gap-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Submitting..." : "Submit Review"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
