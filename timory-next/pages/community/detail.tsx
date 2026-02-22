import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import { useTranslation } from "@/libs/context/useTranslation";
import { Stack, Box, Typography, TextField, Button, IconButton, Menu, MenuItem } from "@mui/material";
import { NextPage } from "next";
import { CalendarToday, Comment, Person, ArrowForward } from "@mui/icons-material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ReplyIcon from "@mui/icons-material/Reply";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import Close from "@mui/icons-material/Close";
import { useRouter } from "next/router";
import { useEffect, useState, useRef, useLayoutEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_BOARD_ARTICLE, GET_COMMENTS } from "@/apollo/user/query";

const CommunityDetail: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const articleId = typeof router.query.id === "string" ? router.query.id : null;
  const { data: articleData } = useQuery(GET_BOARD_ARTICLE, {
    variables: { articleId: articleId ?? "" },
    skip: !articleId,
  });
  const { data: commentsData } = useQuery(GET_COMMENTS, {
    variables: {
      input: {
        page: 1,
        limit: 200,
        search: { commentRefId: articleId ?? "" },
      },
    },
    skip: !articleId,
  });

  const article = useMemo(() => {
    const a = articleData?.getBoardArticle;
    if (!a) return null;
    return {
      id: a._id,
      image: watchImageUrl(a.articleImage, "/img/watch/asosiy1.webp"),
      author: a.memberData?.memberName ?? "",
      authorImage: a.memberData?.memberPhoto ?? undefined,
      memberType: a.memberData?.memberType ?? "Member",
      date:
        a.createdAt &&
        new Date(a.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      comments: a.articleComments ?? 0,
      title: a.articleTitle ?? "",
      content: a.articleContent ?? "",
    };
  }, [articleData]);

  const apiComments = useMemo(() => {
    const list = commentsData?.getComments?.list ?? [];
    return list.map((c: any) => ({
      id: c._id,
      date:
        c.createdAt &&
        new Date(c.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      author: c.memberData?.memberName ?? "",
      text: c.commentContent ?? "",
    }));
  }, [commentsData]);

  const [likedComments, setLikedComments] = useState<string[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [newCommentText, setNewCommentText] = useState("");
  const [extraComments, setExtraComments] = useState<{ id: string; date: string; author: string; text: string }[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [openMenuCommentId, setOpenMenuCommentId] = useState<string | null>(null);
  const [deletedCommentIds, setDeletedCommentIds] = useState<string[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentTexts, setEditedCommentTexts] = useState<Record<string, string>>({});

  const commentsListRef = useRef<HTMLDivElement>(null);
  const commentItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const baseComments = apiComments;
  const allComments = [...baseComments, ...extraComments].filter((c) => !deletedCommentIds.includes(String(c.id)));
  const sortedComments = [...allComments].reverse();
  const commentsCount = allComments.length;

  useEffect(() => {
    if (articleId && !articleLoading && articleData?.getBoardArticle == null) {
      router.push("/community");
    }
  }, [articleId, articleLoading, articleData, router]);

  const handleCommentMenuOpen = (event: React.MouseEvent<HTMLElement>, commentId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setOpenMenuCommentId(commentId);
  };

  const handleCommentMenuClose = () => {
    setMenuAnchorEl(null);
    setOpenMenuCommentId(null);
  };

  const handleEditComment = (commentId: string) => {
    handleCommentMenuClose();
    const comment = allComments.find((c) => String(c.id) === commentId);
    if (comment) {
      setNewCommentText(editedCommentTexts[commentId] ?? comment.text);
      setEditingCommentId(commentId);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setNewCommentText("");
  };

  const handleDeleteComment = (commentId: string) => {
    setDeletedCommentIds((prev) => [...prev, commentId]);
    setExtraComments((prev) => prev.filter((c) => c.id !== commentId));
    handleCommentMenuClose();
  };

  const handleSubmitComment = () => {
    const text = newCommentText.trim();
    if (!text) return;
    if (editingCommentId !== null) {
      const comment = allComments.find((c) => String(c.id) === editingCommentId);
      const originalText = comment?.text ?? "";
      if (text !== originalText) {
        setEditedCommentTexts((prev) => ({ ...prev, [editingCommentId]: text }));
      } else {
        setEditedCommentTexts((prev) => {
          const next = { ...prev };
          delete next[editingCommentId];
          return next;
        });
      }
      setExtraComments((prev) =>
        prev.map((c) => (c.id === editingCommentId ? { ...c, text } : c))
      );
      setEditingCommentId(null);
      setNewCommentText("");
    } else {
      setExtraComments((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          author: "You",
          text,
        },
      ]);
      setNewCommentText("");
    }
  };

  // Calculate height for last 2 comments dynamically
  useLayoutEffect(() => {
    if (commentsListRef.current && commentItemsRef.current.length >= 2) {
      const firstComment = commentItemsRef.current[0];
      const secondComment = commentItemsRef.current[1];
      
      if (firstComment && secondComment) {
        const totalHeight = firstComment.offsetHeight + secondComment.offsetHeight + 50;
        commentsListRef.current.style.maxHeight = `${totalHeight}px`;
      }
    } else if (commentsListRef.current && commentItemsRef.current.length === 1) {
      const firstComment = commentItemsRef.current[0];
      if (firstComment) {
        commentsListRef.current.style.maxHeight = `${firstComment.offsetHeight + 25}px`;
      }
    }
  }, [sortedComments, article]);

  if (articleLoading || (articleId && !article)) {
    return (
      <Stack className="community-detail-page">
        <Typography>{t("commDetail.loading")}</Typography>
      </Stack>
    );
  }

  return (
    <Stack className="community-detail-page">
      <Stack className="community-detail-container">
        {/* Main Article */}
        <Box className="article-main">
          <Box className="article-image">
            <img src={article.image} />
          </Box>

          <Box className="article-header">
            <Typography className="article-title">
              {article.title}
            </Typography>
            <Box className="article-meta">
              <Box component="span" className="meta-item">
                <CalendarToday className="meta-icon" />
                <Typography component="span" className="meta-text">
                  {article.date}
                </Typography>
              </Box>
              <Box component="span" className="meta-item">
                <Comment className="meta-icon" />
                <Typography component="span" className="meta-text">
                  {commentsCount} {commentsCount !== 1 ? t("commDetail.commentCountPlural") : t("commDetail.commentCount")}
                </Typography>
              </Box>
              <Box component="span" className="meta-item meta-author">
                {article.authorImage ? (
                  <>
                    <Box className="meta-author-avatar">
                      <img src={article.authorImage} alt={article.author} />
                    </Box>
                    <Typography component="span" className="meta-text">
                      {article.author}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Person className="meta-icon" />
                    <Typography component="span" className="meta-text">
                      {article.author}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </Box>

          <Box className="article-content">
            <Typography className="article-text">
              {article.content}
            </Typography>
          </Box>

          {/* Back Link */}
          <Box className="watch-back-wrapper">
            <Box className="see-all-text" onClick={() => router.push("/community")}>
              {t("commDetail.back")} <ArrowForward className="see-all-arrow" />
            </Box>
          </Box>
  
          {/* Comments Section */}
          <Box className="comments-section">
            <Box className="comments-title-wrapper">
              <Comment className="comments-title-icon" />
              <Typography className="comments-title">
                {commentsCount} {commentsCount !== 1 ? t("commDetail.commentCountPlural") : t("commDetail.commentCount")}
              </Typography>
            </Box>

            {/* Existing Comments */}
            <Box className="comments-list" ref={commentsListRef}>
              {commentsCount === 0 ? (
                <Box className="no-comments">
                  <Typography className="no-comments-text">{t("commDetail.noComment")}</Typography>
                </Box>
              ) : (
                sortedComments.map((comment, index) => (
                  <Box
                    key={String(comment.id)}
                    className="comment-item"
                    ref={(el: HTMLDivElement | null) => { commentItemsRef.current[index] = el; }}
                  >
                    <Typography className="comment-number">{commentsCount - index}.</Typography>
                    <Box className="comment-content">
                      <Box className="comment-meta">
                        <Box sx={{ display: "flex", alignItems: "center", gap: "20px" }}>
                          <Box component="span" className="comment-meta-item">
                            <CalendarToday className="comment-meta-icon" />
                            <Typography component="span" className="comment-meta-text">
                              {comment.date}
                            </Typography>
                          </Box>
                          <Box component="span" className="comment-meta-item">
                            <Person className="comment-meta-icon" />
                            <Typography component="span" className="comment-meta-text">
                              {comment.author}
                            </Typography>
                          </Box>
                        </Box>
                        {editingCommentId !== String(comment.id) && comment.author === "You" && (
                          <IconButton
                            className="comment-more-btn"
                            size="small"
                            onClick={(e) => handleCommentMenuOpen(e, String(comment.id))}
                            sx={{ padding: "4px" }}
                          >
                            <MoreHoriz sx={{ fontSize: 22, color: "#8c6f5a" }} />
                          </IconButton>
                        )}
                      </Box>
                      <Box className="comment-text-wrapper">
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "20px", width: "100%" }}>
                          <Typography className="comment-text">
                            {editedCommentTexts[String(comment.id)] ?? comment.text}
                          </Typography>
                          <Box className="comment-actions">
                            <Box className="comment-reply-btn">
                              <ReplyIcon className="reply-icon" />
                            </Box>
                            <Box
                              className={`comment-like-btn ${likedComments.includes(String(comment.id)) ? "liked" : ""}`}
                              onClick={() => {
                                const cid = String(comment.id);
                                if (likedComments.includes(cid)) {
                                  setLikedComments((prev) => prev.filter((id) => id !== cid));
                                  setLikeCounts((prev) => ({ ...prev, [cid]: (prev[cid] ?? 0) - 1 }));
                                } else {
                                  setLikedComments((prev) => [...prev, cid]);
                                  setLikeCounts((prev) => ({ ...prev, [cid]: (prev[cid] ?? 0) + 1 }));
                                }
                              }}
                            >
                              {likedComments.includes(String(comment.id)) ? (
                                <FavoriteIcon className="like-icon" />
                              ) : (
                                <FavoriteBorderIcon className="like-icon" />
                              )}
                              <Box className="like-badge">{likeCounts[String(comment.id)] ?? 0}</Box>
                            </Box>
                          </Box>
                        </Box>
                        {editedCommentTexts[String(comment.id)] && (
                          <Typography className="comment-edited">edited</Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))
              )}
            </Box>

            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleCommentMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  "& .MuiMenuItem-root": {
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  },
                },
              }}
            >
              <MenuItem
                onClick={() => {
if (openMenuCommentId !== null) handleEditComment(openMenuCommentId);
                  }}
                >
                {t("commDetail.edit")}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  if (openMenuCommentId !== null) handleDeleteComment(openMenuCommentId);
                }}
              >
                {t("commDetail.delete")}
              </MenuItem>
            </Menu>

            {/* Comment Form */}
            <Box className="comment-form">
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 1 }}>
                <Typography className="comment-form-title">
                  {editingCommentId !== null ? t("commDetail.editComment") : t("commDetail.leaveComment")}
                </Typography>
                {editingCommentId !== null && (
                  <IconButton
                    size="small"
                    onClick={handleCancelEdit}
                    sx={{ color: "#8c6f5a" }}
                    aria-label="Cancel edit"
                  >
                    <Close sx={{ fontSize: 24 }} />
                  </IconButton>
                )}
              </Box>
              <Box className="comment-form-row">
              </Box>
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder={t("commDetail.messagePlaceholder")}
                className="comment-textarea"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                sx={{ 
                  mb: 2,
                  '& .MuiInputBase-input': {
                    paddingTop: '16px !important',
                  },
                  '& textarea': {
                    paddingTop: '16px !important',
                    resize: 'none !important',
                    overflowY: 'auto !important',
                    overflowX: 'hidden !important',
                  },
                  '& .MuiOutlinedInput-root': {
                    overflow: 'visible !important',
                  }
                }}
              />
              <Box className="comment-submit-wrapper">
                <Button className="comment-submit-button" onClick={handleSubmitComment}>
                  {t("commDetail.postComment")}
                  <ArrowForward sx={{ ml: 1, fontSize: 22 }} />
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

      </Stack>
    </Stack>
  );
};

export default withLayoutBasic(CommunityDetail);

