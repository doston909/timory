import { Stack, Box, Typography, Select, MenuItem } from "@mui/material";
import {
  Favorite,
  FavoriteBorderOutlined,
  VisibilityOutlined,
  CommentOutlined,
} from "@mui/icons-material";
import { useState, useMemo } from "react";
import { useRouter } from "next/router";

export type Article = {
  id: string | number;
  image: string;
  author: string;
  memberType?: string;
  date: string;
  comments: number;
  title: string;
  description: string;
  articleType?: string;
  views?: number;
  likes?: number;
};

type CommunityCardProps = {
  articles: Article[];
};

const CommunityCard = ({ articles }: CommunityCardProps) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const articlesPerPage = 4;
  
  // Sort qilingan articlelar
  const sortedArticles = useMemo(() => {
    const sorted = [...articles].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return 0;
    });
    return sorted;
  }, [articles, sortBy]);
  
  const totalPages = Math.ceil(sortedArticles.length / articlesPerPage);

  const startIndex = (currentPage - 1) * articlesPerPage;
  const displayedArticles = sortedArticles.slice(startIndex, startIndex + articlesPerPage);

  const handleLikeClick = (articleId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = String(articleId);
    const currentlyLiked = likedArticles[key] ?? false;
    const nextLiked = !currentlyLiked;
    setLikedArticles((prev) => ({ ...prev, [key]: nextLiked }));
    setLikeCounts((counts) => ({
      ...counts,
      [key]: nextLiked ? (counts[key] ?? 0) + 1 : Math.max(0, (counts[key] ?? 0) - 1),
    }));
  };

  const handleArticleClick = (articleId: string | number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    router.push(`/community/detail?id=${articleId}`);
  };

  return (
    <Stack className="community-main">
      {/* Sort Dropdown */}
      <Box 
        className="community-header" 
        sx={{ 
          display: 'flex', 
          flexDirection: 'row',
          justifyContent: 'flex-end', 
          alignItems: 'center',
          marginBottom: '50px',
          gap: '10px'
        }}
      >
        <Typography 
          className="sort-label"
          sx={{ 
            fontSize: '22px',
            color: '#000000',
            fontWeight: 400,
            whiteSpace: 'nowrap',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          }}
        >
          Sort by
        </Typography>
        <Select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
          className="sort-select"
          sx={{
            minWidth: '200px',
            width: '200px',
            height: '36px',
            borderRadius: '6px',
            fontSize: '18px',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }}
          MenuProps={{
            PaperProps: {
              className: "sort-select-menu",
              sx: {
                '& .MuiMenuItem-root': {
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#c1c1c1',
                    '&:hover': {
                      backgroundColor: '#bbb7b7',
                    }
                  }
                }
              }
            }
          }}
        >
          <MenuItem value="newest">Newest</MenuItem>
          <MenuItem value="oldest">Oldest</MenuItem>
        </Select>
      </Box>
      
      <Stack className="articles-grid">
        {articles.length === 0 ? (
          <Box sx={{ gridColumn: "1 / -1", py: 4, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
            <Typography sx={{ fontSize: 18, color: "#666" }}>
              Not found Article...
            </Typography>
          </Box>
        ) : (
          displayedArticles.map((article) => (
          <Box key={article.id} className="article-card">
            <Box 
              className="article-image"
              onClick={(e) => handleArticleClick(article.id, e)}
            >
              <img src={article.image} alt={article.title} />
              {article.articleType && (
                <Typography className="article-type-label">{article.articleType}</Typography>
              )}
              <Stack className="article-image-icons" direction="column">
                <Box
                  className={`icon-wrapper icon-wrapper-with-count${likedArticles[String(article.id)] ? " icon-wrapper-liked" : ""}`}
                  onClick={(e) => handleLikeClick(article.id, e)}
                >
                  {likedArticles[String(article.id)] ? (
                    <Favorite sx={{ fontSize: 28 }} />
                  ) : (
                    <FavoriteBorderOutlined sx={{ fontSize: 28 }} />
                  )}
                  <span className="icon-wrapper-count">{likeCounts[String(article.id)] ?? article.likes ?? 0}</span>
                </Box>
                <Box className="icon-wrapper icon-wrapper-with-count">
                  <VisibilityOutlined sx={{ fontSize: 28 }} />
                  <span className="icon-wrapper-count">{article.views ?? 0}</span>
                </Box>
                <Box className="icon-wrapper icon-wrapper-with-count">
                  <CommentOutlined sx={{ fontSize: 28 }} />
                  <span className="icon-wrapper-count">{article.comments}</span>
                </Box>
              </Stack>
            </Box>
            <Box className="article-content">
              <Typography className="article-meta">
                <Box component="span" className="article-author-wrapper">
                  {article.memberType && (
                    <Box component="span" className="article-member-type">
                      ({article.memberType.toLowerCase()})
                    </Box>
                  )}
                  <Box component="span" className="article-author">
                 {article.author}
                  </Box>
                </Box>
                <Box component="span">{article.date}</Box>
              </Typography>
              <Typography 
                className="article-title"
                onClick={(e) => handleArticleClick(article.id, e)}
              >
                {article.title}
              </Typography>
              <Typography className="article-description">
                {article.description}
              </Typography>
            </Box>
          </Box>
        ))
        )}
      </Stack>

      {/* Pagination */}
      <Box className="pagination">
        {totalPages > 1 && (
          <Box className="watch-pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Box
                key={page}
                className={`pagination-number ${currentPage === page ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Stack>
  );
};

export default CommunityCard;

