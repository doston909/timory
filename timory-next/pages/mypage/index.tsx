import React, { useState, useEffect, useMemo } from "react";
import { Box, Stack, Typography, Button, Checkbox } from "@mui/material";
import {
  ShoppingBagOutlined,
  FavoriteBorder,
  Favorite,
  VisibilityOutlined,
  CommentOutlined,
  ArrowForwardIos,
  PersonOutline,
  ArrowUpward,
  Close,
  Delete,
  WatchLaterOutlined,
  ArrowDropDown,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import { useReactiveVar } from "@apollo/client";
import { useCart } from "@/libs/context/CartContext";
import { userVar } from "@/apollo/store";
import { getWatchStatus, setWatchStatus } from "@/libs/watchStatusStorage";
import {
  getArticleStatus,
  setArticleStatus,
} from "@/libs/articleStatusStorage";
import withLayoutBasic from "../../libs/components/layout/LayoutBasic";
import { useQuery, useMutation } from "@apollo/client";
import {
  CREATE_WATCH,
  UPDATE_WATCH,
  REMOVE_WATCH,
  IMAGES_UPLOADER,
  IMAGE_UPLOADER,
  UPDATE_MEMBER,
  CREATE_BOARD_ARTICLE,
} from "../../apollo/user/mutation";
import { GET_DEALER_WATCHES, GET_MEMBER, GET_MY_BOARD_ARTICLES } from "../../apollo/user/query";
import { getJwtToken } from "../../libs/auth-token";
import { updateUserInfo } from "../../libs/auth";
import { WatchType as WatchTypeEnum, WatchStatus as WatchStatusEnum } from "../../libs/enums/watch.enum";
import { BoardArticleCategory } from "../../libs/enums/board-article.enum";
import { sweetMixinErrorAlert } from "../../libs/sweetAlert";
import { watchImageUrl } from "../../libs/utils";

/** Dealer watch from API (getDealerWatches list item) */
type DealerWatch = {
  _id: string;
  watchType: string;
  watchStatus: string;
  watchModelName: string;
  watchImages: string[];
  watchPrice: number;
  watchBrand?: string;
  watchViews: number;
  watchLikes: number;
  watchComments: number;
  watchLimitedEdition?: boolean;
  watchDescription?: string;
  createdAt?: string;
};

const ITEMS_PER_PAGE = 6;
const FOLLOWERS_PER_PAGE = 4;
const ARTICLES_PER_PAGE = 3;

const MyPage = () => {
  const router = useRouter();
  const { addToCart } = useCart();
  const user = useReactiveVar(userVar);

  useEffect(() => {
    const token = getJwtToken();
    if (token && !user?._id) updateUserInfo(token);
  }, [user?._id]);

  // Asosiy dealer uchun Follow/Unfollow
  const [isDealerFollowing, setIsDealerFollowing] = useState(false);
  // Followers tab uchun umumiy son (asosiy Follow tugmasiga bog'langan)
  const [totalFollowersCount, setTotalFollowersCount] = useState(6);
  // Asosiy Follow bosgan user Followers ro'yxatida ko'rinsinmi-yo'qmi
  const [isCurrentUserFollower, setIsCurrentUserFollower] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Watches");
  const [followersPage, setFollowersPage] = useState(1);
  const [watchesList, setWatchesList] = useState<DealerWatch[]>([]);
  const { data: dealerWatchesData, refetch: refetchDealerWatches } = useQuery(
    GET_DEALER_WATCHES,
    {
      variables: {
        input: { page: 1, limit: 500, search: {} },
      },
      skip: !user?._id,
    }
  );

  const rawId = user?._id != null ? String(user._id) : "";
  const isValidObjectId = rawId.length === 24 && /^[a-f0-9]+$/i.test(rawId);
  const memberId = isValidObjectId ? rawId : "";
  const shouldFetchMember = !!memberId;
  const { data: memberData } = useQuery(GET_MEMBER, {
    variables: { memberId },
    skip: !shouldFetchMember,
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      const m = data?.getMember;
      if (!m) return;
      const current = (userVar as () => typeof user)();
      if (!current?._id) return;
      userVar({
        ...current,
        memberType: m.memberType ?? current.memberType,
        memberName: m.memberName ?? current.memberName,
        memberEmail: m.memberEmail ?? current.memberEmail,
        memberPhone: m.memberPhone ?? current.memberPhone,
        memberPhoto: m.memberPhoto ?? current.memberPhoto,
        memberAddress: m.memberAddress ?? current.memberAddress,
      });
    },
  });
  const m = memberData?.getMember;
  const displayName = m?.memberName ?? user?.memberName;
  const displayPhone = m?.memberPhone ?? user?.memberPhone;
  const displayEmail = m?.memberEmail ?? user?.memberEmail;
  const displayPhoto = m?.memberPhoto ?? user?.memberPhoto;
  const displayType = m?.memberType ?? user?.memberType;
  const isDealer = String(displayType ?? "").toUpperCase() === "DEALER";
  useEffect(() => {
    const list = dealerWatchesData?.getDealerWatches?.list;
    if (list) setWatchesList(list);
  }, [dealerWatchesData]);
  const [imagesUploaderMutation] = useMutation(IMAGES_UPLOADER, {
    onError: (err) => sweetMixinErrorAlert(err?.message ?? "Image upload failed."),
  });
  const [imageUploaderMutation] = useMutation(IMAGE_UPLOADER, {
    onError: (err) => sweetMixinErrorAlert(err?.message ?? "Image upload failed."),
  });
  const [updateMemberMutation] = useMutation(UPDATE_MEMBER, {
    onCompleted: (data) => {
      if (data?.updateMember && user) {
        userVar({
          ...user,
          memberPhoto: data.updateMember.memberPhoto ?? user.memberPhoto,
        });
      }
    },
    onError: (err) =>
      sweetMixinErrorAlert(err?.message ?? "Failed to update profile."),
  });
  const myBoardArticlesVars = {
    input: { page: 1, limit: 500, search: {} },
  };
  const { data: myArticlesData } = useQuery(GET_MY_BOARD_ARTICLES, {
    variables: myBoardArticlesVars,
    skip: !user?._id,
  });
  const [createBoardArticleMutation, { loading: createArticleLoading }] =
    useMutation(CREATE_BOARD_ARTICLE, {
      refetchQueries: [
        { query: GET_MY_BOARD_ARTICLES, variables: myBoardArticlesVars },
      ],
      onError: (err) =>
        sweetMixinErrorAlert(err?.message ?? "Failed to add article."),
    });
  const [createWatchMutation, { loading: createWatchLoading }] = useMutation(
    CREATE_WATCH,
    {
      onCompleted: () => {
        refetchDealerWatches();
        if (watchImagePreview1) URL.revokeObjectURL(watchImagePreview1);
        if (watchImagePreview2) URL.revokeObjectURL(watchImagePreview2);
        setWatchImagePreview1(null);
        setWatchImagePreview2(null);
        setNewWatch({
          modelName: "",
          watchBrand: "",
          watchType: "",
          price: "",
          color: "",
          caseShape: "",
          caseSize: "",
          madeIn: "",
          date: "",
          waterResistance: "",
          availability: "",
          material: "",
          description: "",
          limitedEdition: false,
          image1: null,
          image2: null,
        });
        setIsAddWatchOpen(false);
      },
      onError: (err) => {
        sweetMixinErrorAlert(err?.message ?? "Failed to add watch.");
      },
    }
  );
  const dealerWatchesVariables = {
    input: { page: 1, limit: 500, search: {} },
  };
  const [updateWatchMutation] = useMutation(UPDATE_WATCH, {
    update(cache, { data }) {
      const updated = data?.updateWatch;
      if (!updated?._id) return;
      try {
        const existing = cache.readQuery<{
          getDealerWatches: { list: DealerWatch[]; metaCounter?: { total: number } };
        }>({
          query: GET_DEALER_WATCHES,
          variables: dealerWatchesVariables,
        });
        if (!existing?.getDealerWatches?.list) return;
        const list = existing.getDealerWatches.list.map((w) =>
          w._id === updated._id ? { ...w, ...updated } : w
        );
        cache.writeQuery({
          query: GET_DEALER_WATCHES,
          variables: dealerWatchesVariables,
          data: {
            getDealerWatches: {
              ...existing.getDealerWatches,
              list,
            },
          },
        });
      } catch {
        // ignore cache errors
      }
    },
    onCompleted: () => refetchDealerWatches(),
    onError: (err) => sweetMixinErrorAlert(err?.message ?? "Failed to update watch."),
  });
  const [removeWatchMutation] = useMutation(REMOVE_WATCH, {
    onCompleted: () => refetchDealerWatches(),
    onError: (err) => sweetMixinErrorAlert(err?.message ?? "Failed to remove watch."),
  });

  useEffect(() => {
    if (!isDealer && activeTab === "Watches") setActiveTab("Favorites");
  }, [isDealer, activeTab]);

  const totalPagesWatches = Math.ceil(watchesList.length / ITEMS_PER_PAGE);
  useEffect(() => {
    if (currentPage > totalPagesWatches && totalPagesWatches > 0)
      setCurrentPage(1);
  }, [watchesList.length, currentPage, totalPagesWatches]);
  // Followers / Followings tablari uchun alohida follow holatlari (tab + id bo'yicha)
  const [followersFollowing, setFollowersFollowing] = useState<{
    [key: string]: boolean;
  }>({});
  // Har bir box uchun Followers soni (kalit: "followers-1", "followings-1", ...)
  const [followersCounts, setFollowersCounts] = useState<{
    [key: string]: number;
  }>(() => {
    const initial: { [key: string]: number } = {};
    for (let i = 1; i <= 6; i += 1) {
      initial[`followers-${i}`] = 10; // Followers tab uchun boshlang'ich qiymat
      initial[`followings-${i}`] = 10; // Followings tab uchun boshlang'ich qiymat
    }
    return initial;
  });
  const [likedWatches, setLikedWatches] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [watchLikes, setWatchLikes] = useState<{ [key: string]: number }>({});
  // Articles uchun like holati va count
  const [articleLiked, setArticleLiked] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [articleLikes, setArticleLikes] = useState<{ [key: number]: number }>({
    1: 12,
    2: 8,
    3: 19,
  });
  const [articlePage, setArticlePage] = useState(1);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [recentlyVisitedPage, setRecentlyVisitedPage] = useState(1);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddWatchOpen, setIsAddWatchOpen] = useState(false);
  const [isWatchTypeOpen, setIsWatchTypeOpen] = useState(false);
  const [isCaseShapeOpen, setIsCaseShapeOpen] = useState(false);
  const [isCaseSizeOpen, setIsCaseSizeOpen] = useState(false);
  const [isMaterialOpen, setIsMaterialOpen] = useState(false);
  const [isAddArticleOpen, setIsAddArticleOpen] = useState(false);
  const [newArticleImageFile, setNewArticleImageFile] = useState<File | null>(null);
  const [newArticleImagePreview, setNewArticleImagePreview] = useState<string | null>(null);
  const [newArticle, setNewArticle] = useState({
    image: null as string | null,
    title: "",
    content: "",
    articleType: "" as string,
  });
  const [newWatch, setNewWatch] = useState({
    modelName: "",
    watchBrand: "",
    watchType: "",
    price: "",
    color: "",
    caseShape: "",
    caseSize: "",
    madeIn: "",
    date: "",
    waterResistance: "",
    availability: "",
    material: "",
    description: "",
    limitedEdition: false,
    image1: null as File | null,
    image2: null as File | null,
  });
  const [watchImagePreview1, setWatchImagePreview1] = useState<string | null>(null);
  const [watchImagePreview2, setWatchImagePreview2] = useState<string | null>(null);
  const isAddWatchValid =
    !!newWatch.modelName &&
    !!newWatch.watchBrand &&
    !!newWatch.watchType &&
    !!newWatch.price &&
    !!newWatch.color &&
    !!newWatch.caseShape &&
    !!newWatch.caseSize &&
    !!newWatch.madeIn &&
    !!newWatch.date &&
    !!newWatch.waterResistance &&
    !!newWatch.availability &&
    !!newWatch.material &&
    !!newWatch.description &&
    (newWatch.image1 != null || newWatch.image2 != null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    username: "",
    phone: "",
    email: "",
    address: "",
    photo: null as string | null,
  });
  useEffect(() => {
    if (user?._id) {
      setProfileData((prev) => ({
        ...prev,
        username: user?.memberName ?? "",
        phone: user?.memberPhone ?? "",
        email: user?.memberEmail ?? "",
        address: user?.memberAddress ?? "",
        photo: user?.memberPhoto ?? null,
      }));
    }
  }, [user?._id, user?.memberName, user?.memberPhone, user?.memberEmail, user?.memberAddress, user?.memberPhoto]);

  type GridWatch = {
    id: string;
    name: string;
    image: string;
    price: string;
    brand?: string;
    likes: number;
    views: number;
    comments: number;
    datePosted?: string;
    limitedEdition?: boolean;
    watchStatus?: boolean;
  };
  const favorites: GridWatch[] = [];
  const recentlyVisited: GridWatch[] = [];

  const totalPages = Math.ceil(watchesList.length / ITEMS_PER_PAGE);
  const totalFavoritesPages = Math.ceil(favorites.length / ITEMS_PER_PAGE);
  const totalRecentlyVisitedPages = Math.ceil(
    recentlyVisited.length / ITEMS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentWatches = watchesList.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const favoritesStartIndex = (favoritesPage - 1) * ITEMS_PER_PAGE;
  const currentFavorites = favorites.slice(
    favoritesStartIndex,
    favoritesStartIndex + ITEMS_PER_PAGE
  );

  const recentlyVisitedStartIndex = (recentlyVisitedPage - 1) * ITEMS_PER_PAGE;
  const currentRecentlyVisited = recentlyVisited.slice(
    recentlyVisitedStartIndex,
    recentlyVisitedStartIndex + ITEMS_PER_PAGE
  );

  const followerBoxes = Array.from({ length: 6 }, (_, i) => i + 1);
  const totalFollowersPages = Math.ceil(
    followerBoxes.length / FOLLOWERS_PER_PAGE
  );
  const followersStartIndex = (followersPage - 1) * FOLLOWERS_PER_PAGE;
  const currentFollowerBoxes = followerBoxes.slice(
    followersStartIndex,
    followersStartIndex + FOLLOWERS_PER_PAGE
  );

  const categoryToType: Record<string, string> = {
    FREE: "Free Board",
    RECOMMEND: "Recommendation",
    NEWS: "News",
  };
  const articlesList = useMemo(() => {
    const list = myArticlesData?.getMyBoardArticles?.list ?? [];
    return list.map((a: any) => ({
      id: a._id,
      type: categoryToType[String(a.articleCategory)] ?? "Free Board",
      date:
        a.createdAt &&
        new Date(a.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      title: a.articleTitle ?? "",
      content: a.articleContent ?? "",
      views: a.articleViews ?? 0,
      likes: a.articleLikes ?? 0,
    }));
  }, [myArticlesData]);

  const totalArticlePages = Math.ceil(articlesList.length / ARTICLES_PER_PAGE);
  const articleStartIndex = (articlePage - 1) * ARTICLES_PER_PAGE;
  const currentArticles = articlesList.slice(
    articleStartIndex,
    articleStartIndex + ARTICLES_PER_PAGE
  );

  useEffect(() => {
    if (articlePage > totalArticlePages && totalArticlePages > 0)
      setArticlePage(1);
  }, [articlesList.length, articlePage, totalArticlePages]);

  const getArticleExcerpt = (content: string, wordLimit = 18) => {
    const words = content.split(/\s+/);
    if (words.length <= wordLimit) return content;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const handleArticleLikeClick = (articleId: string | number) => {
    const key = String(articleId);
    const isLiked = !!articleLiked[key];

    setArticleLiked((prev) => ({
      ...prev,
      [key]: !isLiked,
    }));

    setArticleLikes((prev) => ({
      ...prev,
      [key]: (prev[key] ?? 0) + (isLiked ? -1 : 1),
    }));
  };

  const handleFollowerFollowToggle = (key: string) => {
    const isCurrentlyFollowing = !!followersFollowing[key];

    // Follow / Unfollow holatini almashtirish
    setFollowersFollowing((prev) => ({
      ...prev,
      [key]: !isCurrentlyFollowing,
    }));

    // Followers sonini +1 / -1 ga o'zgartirish
    setFollowersCounts((prev) => ({
      ...prev,
      [key]: (prev[key] ?? 0) + (isCurrentlyFollowing ? -1 : 1),
    }));
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleLikeClick = (watchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = likedWatches[watchId];
    setLikedWatches((prev) => ({
      ...prev,
      [watchId]: !isLiked,
    }));
    setWatchLikes((prev) => ({
      ...prev,
      [watchId]: (isLiked ? (prev[watchId] ?? 0) - 1 : (prev[watchId] ?? 0) + 1),
    }));
  };

  const handleAddToCart = (watch: DealerWatch, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: watch._id,
      name: watch.watchModelName,
      model: watch.watchModelName,
      brand: watch.watchBrand || "",
      price: watch.watchPrice ?? 0,
      image: watchImageUrl(watch.watchImages?.[0]) || "",
      quantity: 1,
    });
  };

  const handleWatchClick = (watchId: string) => {
    router.push(`/watch/detail?id=${watchId}`);
  };
  const formatWatchPrice = (n: number) =>
    "$ " + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
  const parsePrice = (s: string): number =>
    parseFloat(String(s).replace(/[^0-9.-]/g, "")) || 0;

  const pageContent = (
    <Stack className="mypage-page">
      <Box className="mypage-hero">
        <Box className="mypage-hero-bg" />

        <Box className="mypage-hero-content">
          <Box className="mypage-profile">
            <Box className="mypage-avatar-wrapper">
              <img
                src={watchImageUrl(displayPhoto, "/img/profile/defaultUser.svg")}
                alt={displayName ?? ""}
                className="mypage-avatar"
              />
            </Box>

            <Box className="mypage-profile-text">
              <Typography className="mypage-profile-name">
                {displayName || "—"}
              </Typography>
              <Typography className="mypage-profile-phone">
                {displayPhone || "—"}
              </Typography>
              <Typography className="mypage-profile-email">
                {displayEmail || "—"}
              </Typography>
              <Typography className="mypage-profile-role">
                {(displayType?.toUpperCase() === "DEALER" ? "Dealer" : "User") || "—"}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "16px",
              marginTop: "auto",
              paddingBottom: "40px",
              marginRight: "-60px",
            }}
          >
            <Button
              className="mypage-edit-profile-button"
              onClick={() => setIsEditProfileOpen(true)}
            >
              Edit Profile
            </Button>
            <Button
              className="mypage-logout-button"
              onClick={() => {
                // Logout functionality
                console.log("Logout clicked");
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Box>

      <Box className="mypage-tabs">
        {isDealer && (
          <Box
            className={`mypage-tab${
              activeTab === "Watches" ? " mypage-tab-active" : ""
            }`}
            onClick={() => setActiveTab("Watches")}
          >
            Watches ({watchesList.length})
          </Box>
        )}
        <Box
          className={`mypage-tab${
            activeTab === "Favorites" ? " mypage-tab-active" : ""
          }`}
          onClick={() => setActiveTab("Favorites")}
        >
          Favorites ({favorites.length})
        </Box>
        <Box
          className={`mypage-tab${
            activeTab === "Recently Visited" ? " mypage-tab-active" : ""
          }`}
          onClick={() => setActiveTab("Recently Visited")}
        >
          Recently Visited ({recentlyVisited.length})
        </Box>
        <Box
          className={`mypage-tab${
            activeTab === "Followers" ? " mypage-tab-active" : ""
          }`}
          onClick={() => setActiveTab("Followers")}
        >
          Followers ({totalFollowersCount})
        </Box>
        <Box
          className={`mypage-tab${
            activeTab === "Followings" ? " mypage-tab-active" : ""
          }`}
          onClick={() => setActiveTab("Followings")}
        >
          Followings ({followerBoxes.length})
        </Box>
        <Box
          className={`mypage-tab${
            activeTab === "Articles" ? " mypage-tab-active" : ""
          }`}
          onClick={() => setActiveTab("Articles")}
        >
          Articles ({articlesList.length})
        </Box>
      </Box>

      {isDealer && activeTab === "Watches" && (
        <Box className="mypage-watches-container">
          <Box className="mypage-watches-header">
            <Typography className="mypage-watches-container-title">
              Watches
            </Typography>
            <Button
              className="mypage-add-watch-button"
              onClick={() => {
                setIsAddWatchOpen(true);
              }}
            >
              + Add Watch
            </Button>
          </Box>
          {watchesList.length === 0 ? (
            <Typography className="mypage-watches-empty-message">
              The dealer did not load the watch...
            </Typography>
          ) : (
            <>
              <Box className="mypage-watches-grid">
                {currentWatches.map((watch) => (
                  <Box key={watch._id} className="mypage-watch-item">
                    <Box className="mypage-watch-item-left">
                      <img
                        src={watchImageUrl(watch.watchImages?.[0])}
                        alt={watch.watchModelName}
                        className="mypage-watch-item-image"
                        onClick={() => handleWatchClick(watch._id)}
                        style={{ cursor: "pointer" }}
                      />
                      <Box className="mypage-watch-item-icons">
                        <Box
                          className="action-btn"
                          onClick={(e) => handleAddToCart(watch, e)}
                        >
                          <ShoppingBagOutlined
                            sx={{
                              fontSize: 24,
                              color: "#000",
                              fontWeight: 300,
                            }}
                          />
                        </Box>
                        <Box
                          className={`action-btn action-btn-with-count${
                            likedWatches[watch._id] ? " action-btn-liked" : ""
                          }`}
                          onClick={(e) => handleLikeClick(watch._id, e)}
                        >
                          {likedWatches[watch._id] ? (
                            <Favorite
                              sx={{
                                fontSize: 24,
                                color: "#000",
                                fontWeight: 300,
                              }}
                            />
                          ) : (
                            <FavoriteBorder
                              sx={{
                                fontSize: 24,
                                color: "#000",
                                fontWeight: 300,
                              }}
                            />
                          )}
                          {(watchLikes[watch._id] ?? watch.watchLikes) > 0 && (
                            <span className="action-count">
                              {watchLikes[watch._id] ?? watch.watchLikes}
                            </span>
                          )}
                        </Box>
                        <Box className="action-btn action-btn-with-count">
                          <VisibilityOutlined
                            sx={{
                              fontSize: 24,
                              color: "#000",
                              fontWeight: 300,
                            }}
                          />
                          {watch.watchViews != null && watch.watchViews > 0 && (
                            <span className="action-count">{watch.watchViews}</span>
                          )}
                        </Box>
                        <Box className="action-btn action-btn-with-count">
                          <CommentOutlined
                            sx={{
                              fontSize: 24,
                              color: "#000",
                              fontWeight: 300,
                            }}
                          />
                          {(watch.watchComments ?? 0) > 0 && (
                            <span className="action-count">
                              {watch.watchComments}
                            </span>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <Box className="mypage-watch-item-right">
                      {watch.watchLimitedEdition && (
                        <Typography className="mypage-watch-limited-edition">
                          Limited edition
                        </Typography>
                      )}
                      {watch.watchBrand && (
                        <Typography className="mypage-watch-item-brand">
                          {watch.watchBrand}
                        </Typography>
                      )}
                      <Typography
                        className="mypage-watch-item-name"
                        onClick={() => handleWatchClick(watch._id)}
                        style={{ cursor: "pointer" }}
                      >
                        {watch.watchModelName}
                      </Typography>
                      <Typography className="mypage-watch-item-price">
                        {formatWatchPrice(watch.watchPrice)}
                      </Typography>
                      {watch.createdAt && (
                        <Typography className="mypage-watch-item-date">
                          {watch.createdAt}
                        </Typography>
                      )}
                      <Box className="mypage-watch-status-control">
                        <select
                          className={`mypage-watch-status-select${
                            watch.watchStatus === "DELETE"
                              ? " mypage-watch-item-status-deleted"
                              : watch.watchStatus === "SOLD"
                              ? " mypage-watch-item-status-sold-out"
                              : ""
                          }`}
                          value={
                            watch.watchStatus === "ACTIVE"
                              ? "on_sale"
                              : watch.watchStatus === "SOLD"
                              ? "sold_out"
                              : watch.watchStatus === "DELETE"
                              ? "delete"
                              : "on_sale"
                          }
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "remove") {
                              removeWatchMutation({
                                variables: { watchId: watch._id },
                              });
                              setWatchesList((prev) =>
                                prev.filter((w) => w._id !== watch._id)
                              );
                              return;
                            }
                            const status =
                              v === "delete"
                                ? WatchStatusEnum.DELETE
                                : v === "on_sale"
                                ? WatchStatusEnum.ACTIVE
                                : WatchStatusEnum.SOLD;
                            updateWatchMutation({
                              variables: {
                                input: { _id: watch._id, watchStatus: status },
                              },
                            });
                            setWatchesList((prev) =>
                              prev.map((w) =>
                                w._id === watch._id
                                  ? { ...w, watchStatus: status }
                                  : w
                              )
                            );
                          }}
                        >
                          <option value="on_sale">ON SALE</option>
                          <option value="sold_out">SOLD OUT</option>
                          <option value="delete">DELETE</option>
                          <option value="remove">REMOVE</option>
                        </select>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
              {totalPages > 1 && (
                <Box className="mypage-watches-pagination">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        className={`mypage-watches-page-number${
                          page === currentPage ? " active" : ""
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {activeTab === "Favorites" && (
        <Box className="mypage-watches-container">
          <Typography className="mypage-watches-container-title">
            Favorites
          </Typography>
          {favorites.length === 0 ? (
            <Typography className="mypage-watches-empty-message">
              No favorites yet...
            </Typography>
          ) : (
            <>
              <Box className="mypage-watches-grid">
                {currentFavorites.map((watch) => (
                  <Box key={watch.id} className="mypage-watch-item">
                    <Box className="mypage-watch-item-left">
                      <img
                        src={watch.image}
                        alt={watch.name}
                        className="mypage-watch-item-image"
                        onClick={() => handleWatchClick(watch.id)}
                        style={{ cursor: "pointer" }}
                      />
                      <Box className="mypage-watch-item-icons">
                        <Box
                          className="action-btn"
                          onClick={(e) => handleAddToCart(watch, e)}
                        >
                          <ShoppingBagOutlined
                            sx={{
                              fontSize: 24,
                              color: "#000",
                              fontWeight: 300,
                            }}
                          />
                        </Box>
                        <Box
                          className={`action-btn action-btn-with-count${
                            likedWatches[watch.id] ? " action-btn-liked" : ""
                          }`}
                          onClick={(e) => handleLikeClick(watch.id, e)}
                        >
                          {likedWatches[watch.id] ? (
                            <Favorite
                              sx={{
                                fontSize: 24,
                                color: "#000",
                                fontWeight: 300,
                              }}
                            />
                          ) : (
                            <FavoriteBorder
                              sx={{
                                fontSize: 24,
                                color: "#000",
                                fontWeight: 300,
                              }}
                            />
                          )}
                          {watchLikes[watch.id] > 0 && (
                            <span className="action-count">
                              {watchLikes[watch.id]}
                            </span>
                          )}
                        </Box>
                        <Box className="action-btn action-btn-with-count">
                          <VisibilityOutlined
                            sx={{
                              fontSize: 24,
                              color: "#000",
                              fontWeight: 300,
                            }}
                          />
                          {watch.views && (
                            <span className="action-count">{watch.views}</span>
                          )}
                        </Box>
                        <Box className="action-btn action-btn-with-count">
                          <CommentOutlined
                            sx={{
                              fontSize: 24,
                              color: "#000",
                              fontWeight: 300,
                            }}
                          />
                          {watch.comments && (
                            <span className="action-count">
                              {watch.comments}
                            </span>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <Box className="mypage-watch-item-right">
                      {watch.limitedEdition && (
                        <Typography className="mypage-watch-limited-edition">
                          Limited edition
                        </Typography>
                      )}
                      {watch.brand && (
                        <Typography className="mypage-watch-item-brand">
                          {watch.brand}
                        </Typography>
                      )}
                      <Typography
                        className="mypage-watch-item-name"
                        onClick={() => handleWatchClick(watch.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {watch.name}
                      </Typography>
                      <Typography className="mypage-watch-item-price">
                        {watch.price}
                      </Typography>
                      {watch.datePosted && (
                        <Typography className="mypage-watch-item-date">
                          {watch.datePosted}
                        </Typography>
                      )}
                      {watch.watchStatus !== undefined && (
                        <Typography
                          className={`mypage-watch-item-status${
                            !watch.watchStatus
                              ? " mypage-watch-item-status-sold-out"
                              : ""
                          }`}
                        >
                          {watch.watchStatus ? "on sale" : "sold out"}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
              {totalFavoritesPages > 1 && (
                <Box className="mypage-watches-pagination">
                  {Array.from({ length: totalFavoritesPages }).map(
                    (_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          className={`mypage-watches-page-number${
                            page === favoritesPage ? " active" : ""
                          }`}
                          onClick={() => setFavoritesPage(page)}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {activeTab === "Recently Visited" && (
        <Box className="mypage-watches-container">
          <Typography className="mypage-watches-container-title">
            Recently Visited
          </Typography>
          {recentlyVisited.length === 0 ? (
            <Typography className="mypage-watches-empty-message">
              No recently visited watches...
            </Typography>
          ) : (
            <>
              <Box className="mypage-watches-grid">
                {currentRecentlyVisited.map((watch) => (
                  <Box key={watch.id} className="mypage-watch-item">
                    <Box className="mypage-watch-item-left">
                      <img
                        src={watch.image}
                        alt={watch.name}
                        className="mypage-watch-item-image"
                        onClick={() => handleWatchClick(watch.id)}
                        style={{ cursor: "pointer" }}
                      />
                      <Box className="mypage-watch-item-icons">
                        <Box
                          className="action-btn"
                          onClick={(e) => handleAddToCart(watch, e)}
                        >
                          <ShoppingBagOutlined
                            sx={{
                              fontSize: 24,
                              color: "#000",
                              fontWeight: 300,
                            }}
                          />
                        </Box>
                        <Box
                          className={`action-btn action-btn-with-count${
                            likedWatches[watch.id] ? " action-btn-liked" : ""
                          }`}
                          onClick={(e) => handleLikeClick(watch.id, e)}
                        >
                          {likedWatches[watch.id] ? (
                            <Favorite
                              sx={{
                                fontSize: 24,
                                color: "#000",
                                fontWeight: 300,
                              }}
                            />
                          ) : (
                            <FavoriteBorder
                              sx={{
                                fontSize: 24,
                                color: "#000",
                                fontWeight: 300,
                              }}
                            />
                          )}
                          {watchLikes[watch.id] > 0 && (
                            <span className="action-count">
                              {watchLikes[watch.id]}
                            </span>
                          )}
                        </Box>
                        <Box className="action-btn action-btn-with-count">
                          <VisibilityOutlined
                            sx={{
                              fontSize: 24,
                              color: "#000",
                              fontWeight: 300,
                            }}
                          />
                          {watch.views && (
                            <span className="action-count">{watch.views}</span>
                          )}
                        </Box>
                        <Box className="action-btn action-btn-with-count">
                          <CommentOutlined
                            sx={{
                              fontSize: 24,
                              color: "#000",
                              fontWeight: 300,
                            }}
                          />
                          {watch.comments && (
                            <span className="action-count">
                              {watch.comments}
                            </span>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <Box className="mypage-watch-item-right">
                      {watch.limitedEdition && (
                        <Typography className="mypage-watch-limited-edition">
                          Limited edition
                        </Typography>
                      )}
                      {watch.brand && (
                        <Typography className="mypage-watch-item-brand">
                          {watch.brand}
                        </Typography>
                      )}
                      <Typography
                        className="mypage-watch-item-name"
                        onClick={() => handleWatchClick(watch.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {watch.name}
                      </Typography>
                      <Typography className="mypage-watch-item-price">
                        {watch.price}
                      </Typography>
                      {watch.datePosted && (
                        <Typography className="mypage-watch-item-date">
                          {watch.datePosted}
                        </Typography>
                      )}
                      {watch.watchStatus !== undefined && (
                        <Typography
                          className={`mypage-watch-item-status${
                            !watch.watchStatus
                              ? " mypage-watch-item-status-sold-out"
                              : ""
                          }`}
                        >
                          {watch.watchStatus ? "on sale" : "sold out"}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
              {totalRecentlyVisitedPages > 1 && (
                <Box className="mypage-watches-pagination">
                  {Array.from({ length: totalRecentlyVisitedPages }).map(
                    (_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          className={`mypage-watches-page-number${
                            page === recentlyVisitedPage ? " active" : ""
                          }`}
                          onClick={() => setRecentlyVisitedPage(page)}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {activeTab === "Followers" && (
        <Box className="mypage-followers-container">
          <Typography className="mypage-watches-container-title">
            Followers
          </Typography>
          {currentFollowerBoxes.length === 0 ? (
            <Typography className="mypage-watches-empty-message">
              No Followers...
            </Typography>
          ) : (
            <>
              <Box className="mypage-followers-grid">
                {isCurrentUserFollower && (
                  <Box className="mypage-followers-box">
                    <Box className="mypage-followers-box-part part-1">
                      <img
                        src="/img/profile/defaultUser.svg"
                        alt="You"
                        className="mypage-followers-avatar"
                      />
                    </Box>
                    <Box className="mypage-followers-box-part part-2">
                      <Typography className="mypage-followers-name">
                        You
                      </Typography>
                      <Typography className="mypage-followers-role">
                        User
                      </Typography>
                    </Box>
                    <Box className="mypage-followers-box-part part-3">
                      <Typography className="mypage-followers-label">
                        Followers (10)
                      </Typography>
                    </Box>
                    <Box className="mypage-followers-box-part part-4">
                      <Typography className="mypage-followers-label">
                        Followings (5)
                      </Typography>
                    </Box>
                    <Box className="mypage-followers-box-part part-5">
                      <Button
                        className={`mypage-follow-button mypage-follow-button-active`}
                        onClick={() =>
                          setIsDealerFollowing((prev) => {
                            setTotalFollowersCount(
                              (count) => count + (prev ? -1 : 1)
                            );
                            setIsCurrentUserFollower(!prev);
                            return !prev;
                          })
                        }
                      >
                        Unfollow
                      </Button>
                    </Box>
                  </Box>
                )}
                {currentFollowerBoxes.map((id) => {
                  const key = `followers-${id}`;
                  const isFollowerFollowing = !!followersFollowing[key];
                  const hasAvatar = true; // hozircha hamma uchun rasm bor deb olaylik
                  return (
                    <Box key={id} className="mypage-followers-box">
                      <Box className="mypage-followers-box-part part-1">
                        {hasAvatar ? (
                          <img
                            src="/img/profile/about1.jpeg"
                            alt="Follower"
                            className="mypage-followers-avatar"
                          />
                        ) : (
                          <PersonOutline className="mypage-followers-avatar-icon" />
                        )}
                      </Box>
                      <Box className="mypage-followers-box-part part-2">
                        <Typography className="mypage-followers-name">
                          User name
                        </Typography>
                        <Typography className="mypage-followers-role">
                          Dealer
                        </Typography>
                      </Box>
                      <Box className="mypage-followers-box-part part-3">
                        <Typography className="mypage-followers-label">
                          Followers ({followersCounts[key] ?? 0})
                        </Typography>
                      </Box>
                      <Box className="mypage-followers-box-part part-4">
                        <Typography className="mypage-followers-label">
                          Followings (5)
                        </Typography>
                      </Box>
                      <Box className="mypage-followers-box-part part-5">
                        <Button
                          className={`mypage-follow-button${
                            isFollowerFollowing
                              ? " mypage-follow-button-active"
                              : ""
                          }`}
                          onClick={() => handleFollowerFollowToggle(key)}
                        >
                          {isFollowerFollowing ? "Unfollow" : "Follow"}
                        </Button>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              {totalFollowersPages > 1 && (
                <Box className="mypage-watches-pagination">
                  {Array.from({ length: totalFollowersPages }).map(
                    (_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          className={`mypage-watches-page-number${
                            page === followersPage ? " active" : ""
                          }`}
                          onClick={() => setFollowersPage(page)}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {activeTab === "Followings" && (
        <Box className="mypage-followers-container">
          <Typography className="mypage-watches-container-title">
            Followings
          </Typography>
          {currentFollowerBoxes.length === 0 ? (
            <Typography className="mypage-watches-empty-message">
              No Followings...
            </Typography>
          ) : (
            <>
              <Box className="mypage-followers-grid">
                {currentFollowerBoxes.map((id) => {
                  const key = `followings-${id}`;
                  const isFollowerFollowing = !!followersFollowing[key];
                  const hasAvatar = true;
                  return (
                    <Box key={id} className="mypage-followers-box">
                      <Box className="mypage-followers-box-part part-1">
                        {hasAvatar ? (
                          <img
                            src="/img/profile/about1.jpeg"
                            alt="Follower"
                            className="mypage-followers-avatar"
                          />
                        ) : (
                          <PersonOutline className="mypage-followers-avatar-icon" />
                        )}
                      </Box>
                      <Box className="mypage-followers-box-part part-2">
                        <Typography className="mypage-followers-name">
                          User name
                        </Typography>
                        <Typography className="mypage-followers-role">
                          Dealer
                        </Typography>
                      </Box>
                      <Box className="mypage-followers-box-part part-3">
                        <Typography className="mypage-followers-label">
                          Followers ({followersCounts[key] ?? 0})
                        </Typography>
                      </Box>
                      <Box className="mypage-followers-box-part part-4">
                        <Typography className="mypage-followers-label">
                          Followings (5)
                        </Typography>
                      </Box>
                      <Box className="mypage-followers-box-part part-5">
                        <Button
                          className={`mypage-follow-button${
                            isFollowerFollowing
                              ? " mypage-follow-button-active"
                              : ""
                          }`}
                          onClick={() => handleFollowerFollowToggle(key)}
                        >
                          {isFollowerFollowing ? "Unfollow" : "Follow"}
                        </Button>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              {totalFollowersPages > 1 && (
                <Box className="mypage-watches-pagination">
                  {Array.from({ length: totalFollowersPages }).map(
                    (_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          className={`mypage-watches-page-number${
                            page === followersPage ? " active" : ""
                          }`}
                          onClick={() => setFollowersPage(page)}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {activeTab === "Articles" && (
        <Box className="mypage-followers-container">
          <Box className="mypage-watches-header">
            <Typography className="mypage-watches-container-title">
              Articles
            </Typography>
            <Button
              className="mypage-add-watch-button"
              onClick={() => setIsAddArticleOpen(true)}
            >
              + Add Article
            </Button>
          </Box>
          <Box className="mypage-articles-box">
            {articlesList.length === 0 ? (
              <Typography className="mypage-watches-empty-message">
                The dealer did not load the article...
              </Typography>
            ) : (
              <>
                <Box className="mypage-articles-grid">
                  {currentArticles.map((article) => (
                    <Box key={article.id} className="mypage-article-card">
                      <Box className="mypage-article-header">
                        <Typography className="mypage-article-type">
                          {article.type}
                        </Typography>
                        <Typography className="mypage-article-date">
                          {article.date}
                        </Typography>
                      </Box>

                      <Box className="mypage-article-body">
                        <Box
                          className="mypage-article-title"
                          onClick={() =>
                            router.push(`/community/detail?id=${article.id}`)
                          }
                          sx={{ cursor: "pointer" }}
                        >
                          <Typography className="mypage-article-title-text">
                            {article.title, }
                          </Typography>
                        </Box>
                        <Box className="mypage-article-excerpt">
                          <Typography className="mypage-article-excerpt-text">
                            {getArticleExcerpt(article.content, 15)}
                          </Typography>
                        </Box>

                        <Box className="mypage-article-actions">
                          <Box
                            className="mypage-article-read-more"
                            onClick={() =>
                              router.push(`/community/detail?id=${article.id}`)
                            }
                          >
                            <Typography className="mypage-article-read-more-text">
                              Read more
                            </Typography>
                            <ArrowForwardIos className="mypage-article-read-more-arrow" />
                          </Box>
                          <Box className="mypage-article-actions-right-column">
                            <Box className="mypage-article-actions-right">
                              <Box className="mypage-article-action">
                                <VisibilityOutlined
                                  sx={{ fontSize: 22, color: "#000000" }}
                                />
                                {article.views !== undefined && (
                                  <Typography className="mypage-article-action-count">
                                    {article.views}
                                  </Typography>
                                )}
                              </Box>
                              <Box
                                className="mypage-article-action"
                                onClick={() =>
                                  handleArticleLikeClick(article.id)
                                }
                              >
                                {articleLiked[article.id] ? (
                                  <Favorite
                                    sx={{ fontSize: 22, color: "#f09620" }}
                                  />
                                ) : (
                                  <FavoriteBorder
                                    sx={{ fontSize: 22, color: "#000000" }}
                                  />
                                )}
                                <Typography className="mypage-article-action-count">
                                  {articleLikes[article.id] ??
                                    article.likes ??
                                    0}
                                </Typography>
                              </Box>
                            </Box>
                            <Box className="mypage-article-status-control">
                              <select
                                className={`mypage-article-status-select${
                                  getArticleStatus(article.id)?.status ===
                                  "deleted"
                                    ? " mypage-article-status-deleted"
                                    : ""
                                }`}
                                value={
                                  getArticleStatus(article.id)?.status ===
                                  "deleted"
                                    ? "delete"
                                    : "publishing"
                                }
                                onChange={(e) => {
                                  const v = e.target.value;
                                  if (v === "delete") {
                                    setArticleStatus(
                                      article.id,
                                      "deleted",
                                      user?._id
                                    );
                                    setArticlesList((prev) => [...prev]);
                                    return;
                                  }
                                  if (v === "remove") {
                                    setArticlesList((prev) =>
                                      prev.filter((a) => a.id !== article.id)
                                    );
                                    setArticleStatus(
                                      article.id,
                                      "removed",
                                      user?._id
                                    );
                                    return;
                                  }
                                  setArticleStatus(article.id, "publishing");
                                  articlesList((prev) => [...prev]);
                                }}
                              >
                                <option value="publishing">Publishing</option>
                                <option value="delete">Delete</option>
                                <option value="remove">Remove</option>
                              </select>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {totalArticlePages > 1 && (
                  <Box className="mypage-watches-pagination">
                    {Array.from({ length: totalArticlePages }).map(
                      (_, index) => {
                        const page = index + 1;
                        return (
                          <button
                            key={page}
                            className={`mypage-watches-page-number${
                              page === articlePage ? " active" : ""
                            }`}
                            onClick={() => setArticlePage(page)}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      )}

      {isEditProfileOpen && (
        <Box className="mypage-edit-profile-modal">
          <Box
            className="mypage-edit-profile-modal-overlay"
            onClick={() => setIsEditProfileOpen(false)}
          />
          <Box className="mypage-edit-profile-modal-content">
            <Box className="mypage-edit-profile-modal-header">
              <Typography className="mypage-edit-profile-modal-title">
                Edit Profile
              </Typography>
              <Button
                className="mypage-edit-profile-modal-close"
                onClick={() => setIsEditProfileOpen(false)}
              >
                <Close />
              </Button>
            </Box>

            <Box className="mypage-edit-profile-form">
              <Box className="mypage-edit-profile-section">
                <Typography className="mypage-edit-profile-section-title">
                  Photo
                </Typography>
                <Box className="mypage-edit-profile-photo-section">
                  <Box className="mypage-edit-profile-photo-wrapper">
                    <Box className="mypage-edit-profile-photo-placeholder">
                      {profilePhotoPreview || profileData.photo ? (
                        <img
                          src={
                            profilePhotoPreview ||
                            watchImageUrl(profileData.photo, "/img/profile/ceo.png")
                          }
                          alt="Profile"
                          className="mypage-edit-profile-photo"
                        />
                      ) : (
                        <PersonOutline className="mypage-edit-profile-photo-icon" />
                      )}
                    </Box>
                    {(profilePhotoPreview || profileData.photo) && (
                      <Button
                        className="mypage-edit-profile-photo-cancel"
                        onClick={() => {
                          if (profilePhotoPreview) {
                            URL.revokeObjectURL(profilePhotoPreview);
                            setProfilePhotoPreview(null);
                          }
                          setProfilePhotoFile(null);
                          setProfileData({ ...profileData, photo: null });
                        }}
                      >
                        <Delete />
                      </Button>
                    )}
                  </Box>
                  <Box className="mypage-edit-profile-photo-actions">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      style={{ display: "none" }}
                      id="mypage-profile-image-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
                          setProfilePhotoFile(file);
                          setProfilePhotoPreview(URL.createObjectURL(file));
                        }
                        e.target.value = "";
                      }}
                    />
                    <Button
                      className="mypage-edit-profile-upload-button"
                      onClick={() => {
                        const input = document.getElementById(
                          "mypage-profile-image-upload"
                        );
                        input?.click();
                      }}
                    >
                      Upload Profile Image
                    </Button>
                    <Typography className="mypage-edit-profile-photo-hint">
                      A photo must be in JPG, JPEG or PNG format!
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box className="mypage-edit-profile-fields">
                <Box className="mypage-edit-profile-field">
                  <Typography className="mypage-edit-profile-label">
                    Username
                  </Typography>
                  <input
                    type="text"
                    className="mypage-edit-profile-input"
                    value={profileData.username}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        username: e.target.value,
                      })
                    }
                  />
                </Box>

                <Box className="mypage-edit-profile-field">
                  <Typography className="mypage-edit-profile-label">
                    Phone
                  </Typography>
                  <input
                    type="text"
                    className="mypage-edit-profile-input"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                  />
                </Box>

                <Box className="mypage-edit-profile-field">
                  <Typography className="mypage-edit-profile-label">
                    Email
                  </Typography>
                  <input
                    type="email"
                    className="mypage-edit-profile-input"
                    value={profileData.email}
                    placeholder="Your email"
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                  />
                </Box>

                <Box className="mypage-edit-profile-field">
                  <Typography className="mypage-edit-profile-label">
                    Address
                  </Typography>
                  <input
                    type="text"
                    className="mypage-edit-profile-input"
                    value={profileData.address}
                    placeholder="Your address"
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: e.target.value,
                      })
                    }
                  />
                </Box>
              </Box>

              <Box className="mypage-edit-profile-footer">
                <Button
                  className="mypage-edit-profile-update-button"
                  onClick={async () => {
                    let photoUrl: string | null = profileData.photo;
                    if (profilePhotoFile) {
                      try {
                        const { data } = await imageUploaderMutation({
                          variables: { file: profilePhotoFile, target: "member" },
                        });
                        if (data?.imageUploader) photoUrl = data.imageUploader;
                        if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
                        setProfilePhotoPreview(null);
                        setProfilePhotoFile(null);
                      } catch {
                        return;
                      }
                    }
                    try {
                      await updateMemberMutation({
                        variables: {
                          input: {
                            ...(photoUrl != null && { memberPhoto: photoUrl }),
                            ...(profileData.username && { memberName: profileData.username }),
                            ...(profileData.phone && { memberPhone: profileData.phone }),
                            ...(profileData.email !== undefined && { memberEmail: profileData.email }),
                            ...(profileData.address !== undefined && { memberAddress: profileData.address }),
                          },
                        },
                      });
                      setIsEditProfileOpen(false);
                    } catch {
                      // error already shown by mutation onError
                    }
                  }}
                >
                  Update Profile
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {isAddWatchOpen && (
        <Box className="mypage-edit-profile-modal">
          <Box
            className="mypage-edit-profile-modal-overlay"
            onClick={() => setIsAddWatchOpen(false)}
          />
          <Box className="mypage-edit-profile-modal-content">
            <Box className="mypage-edit-profile-modal-header">
              <Typography className="mypage-edit-profile-modal-title">
                Add Watch
              </Typography>
              <Button
                className="mypage-edit-profile-modal-close"
                onClick={() => setIsAddWatchOpen(false)}
              >
                <Close />
              </Button>
            </Box>

            <Box className="mypage-add-watch-form">
              <Box className="mypage-add-watch-images-section">
                <Box className="mypage-add-watch-image-block">
                  <Box className="mypage-add-watch-image-wrapper">
                    <Box className="mypage-add-watch-image-placeholder">
                      {watchImagePreview1 ? (
                        <img
                          src={watchImagePreview1}
                          alt="Watch 1"
                          className="mypage-add-watch-image"
                        />
                      ) : (
                        <WatchLaterOutlined className="mypage-add-watch-image-icon" />
                      )}
                    </Box>
                    {newWatch.image1 && (
                      <Button
                        className="mypage-add-watch-image-remove"
                        onClick={() => {
                          if (watchImagePreview1) URL.revokeObjectURL(watchImagePreview1);
                          setWatchImagePreview1(null);
                          setNewWatch((prev) => ({ ...prev, image1: null }));
                        }}
                      >
                        <Delete />
                      </Button>
                    )}
                  </Box>
                  <Box className="mypage-add-watch-image-actions">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      style={{ display: "none" }}
                      id="mypage-add-watch-image-1"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (watchImagePreview1) URL.revokeObjectURL(watchImagePreview1);
                          setWatchImagePreview1(URL.createObjectURL(file));
                          setNewWatch((prev) => ({ ...prev, image1: file }));
                        }
                        e.target.value = "";
                      }}
                    />
                    <Button
                      className="mypage-edit-profile-upload-button"
                      onClick={() => {
                        const input = document.getElementById(
                          "mypage-add-watch-image-1"
                        ) as HTMLInputElement | null;
                        input?.click();
                      }}
                    >
                      Upload Watch Image 1
                    </Button>
                    <Typography className="mypage-edit-profile-photo-hint">
                      A photo must be in JPG, JPEG or PNG format!
                    </Typography>
                  </Box>
                </Box>

                <Box className="mypage-add-watch-image-block">
                  <Box className="mypage-add-watch-image-wrapper">
                    <Box className="mypage-add-watch-image-placeholder">
                      {watchImagePreview2 ? (
                        <img
                          src={watchImagePreview2}
                          alt="Watch 2"
                          className="mypage-add-watch-image"
                        />
                      ) : (
                        <WatchLaterOutlined className="mypage-add-watch-image-icon" />
                      )}
                    </Box>
                    {newWatch.image2 && (
                      <Button
                        className="mypage-add-watch-image-remove"
                        onClick={() => {
                          if (watchImagePreview2) URL.revokeObjectURL(watchImagePreview2);
                          setWatchImagePreview2(null);
                          setNewWatch((prev) => ({ ...prev, image2: null }));
                        }}
                      >
                        <Delete />
                      </Button>
                    )}
                  </Box>
                  <Box className="mypage-add-watch-image-actions">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      style={{ display: "none" }}
                      id="mypage-add-watch-image-2"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (watchImagePreview2) URL.revokeObjectURL(watchImagePreview2);
                          setWatchImagePreview2(URL.createObjectURL(file));
                          setNewWatch((prev) => ({ ...prev, image2: file }));
                        }
                        e.target.value = "";
                      }}
                    />
                    <Button
                      className="mypage-edit-profile-upload-button"
                      onClick={() => {
                        const input = document.getElementById(
                          "mypage-add-watch-image-2"
                        ) as HTMLInputElement | null;
                        input?.click();
                      }}
                    >
                      Upload Watch Image 2
                    </Button>
                    <Typography className="mypage-edit-profile-photo-hint">
                      A photo must be in JPG, JPEG or PNG format!
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box className="mypage-add-watch-fields">
                {/* Row 1: Model Name | Watch Brand */}
                <Box className="mypage-add-watch-row">
                  <Box className="mypage-add-watch-field">
                    <Typography className="mypage-add-watch-label">
                      Model Name
                    </Typography>
                    <input
                      type="text"
                      className="mypage-add-watch-input"
                      placeholder="Enter model name"
                      value={newWatch.modelName}
                      onChange={(e) =>
                        setNewWatch((prev) => ({
                          ...prev,
                          modelName: e.target.value,
                        }))
                      }
                    />
                  </Box>

                  <Box className="mypage-add-watch-field">
                    <Typography className="mypage-add-watch-label">
                      Watch Brand
                    </Typography>
                    <input
                      type="text"
                      className="mypage-add-watch-input"
                      placeholder="Enter watch brand"
                      value={newWatch.watchBrand}
                      onChange={(e) =>
                        setNewWatch((prev) => ({
                          ...prev,
                          watchBrand: e.target.value,
                        }))
                      }
                    />
                  </Box>
                </Box>

                {/* Row 2: Watch Type | Price */}
                <Box className="mypage-add-watch-row">
                  <Box className="mypage-add-watch-field mypage-add-watch-field-watch-type">
                    <Typography className="mypage-add-watch-label">
                      Watch Type
                    </Typography>
                    <Box
                      className="mypage-add-watch-input-with-arrow"
                      onClick={() => setIsWatchTypeOpen((prev) => !prev)}
                    >
                      <input
                        type="text"
                        className="mypage-add-watch-input"
                        placeholder="Choose watch type"
                        value={newWatch.watchType}
                        readOnly
                      />
                      <ArrowDropDown className="mypage-add-watch-type-arrow" />
                    </Box>
                    {isWatchTypeOpen && (
                      <Box className="mypage-add-watch-type-dropdown">
                        {["Men", "Women", "Unisex", "Sport"].map((option) => (
                          <Box
                            key={option}
                            className={`mypage-add-watch-type-option${
                              newWatch.watchType === option
                                ? " mypage-add-watch-type-option-active"
                                : ""
                            }`}
                            onClick={() => {
                              setNewWatch((prev) => ({
                                ...prev,
                                watchType: option,
                              }));
                              setIsWatchTypeOpen(false);
                            }}
                          >
                            {option}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>

                  <Box className="mypage-add-watch-field">
                    <Typography className="mypage-add-watch-label">
                      Price
                    </Typography>
                    <input
                      type="text"
                      className="mypage-add-watch-input"
                      placeholder="Enter price, e.g. $ 4,500.00"
                      value={newWatch.price}
                      onChange={(e) =>
                        setNewWatch((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                    />
                  </Box>
                </Box>

                {/* Row 3: Color | Case Shape */}
                <Box className="mypage-add-watch-row">
                  <Box className="mypage-add-watch-field">
                    <Typography className="mypage-add-watch-label">
                      Color
                    </Typography>
                    <input
                      type="text"
                      className="mypage-add-watch-input"
                      placeholder="Enter color"
                      value={newWatch.color}
                      onChange={(e) =>
                        setNewWatch((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                    />
                  </Box>

                  <Box className="mypage-add-watch-field mypage-add-watch-field-case-shape">
                    <Typography className="mypage-add-watch-label">
                      Case Shape
                    </Typography>
                    <Box
                      className="mypage-add-watch-input-with-arrow"
                      onClick={() => setIsCaseShapeOpen((prev) => !prev)}
                    >
                      <input
                        type="text"
                        className="mypage-add-watch-input"
                        placeholder="Choose case shape"
                        value={newWatch.caseShape}
                        readOnly
                      />
                      <ArrowDropDown className="mypage-add-watch-type-arrow" />
                    </Box>
                    {isCaseShapeOpen && (
                      <Box className="mypage-add-watch-type-dropdown">
                        {[
                          "Round",
                          "Square",
                          "Rectangular",
                          "Cushion",
                          "Tonneau",
                          "Oval",
                          "Octagon",
                          "Custom",
                        ].map((option) => (
                          <Box
                            key={option}
                            className={`mypage-add-watch-type-option${
                              newWatch.caseShape === option
                                ? " mypage-add-watch-type-option-active"
                                : ""
                            }`}
                            onClick={() => {
                              setNewWatch((prev) => ({
                                ...prev,
                                caseShape: option,
                              }));
                              setIsCaseShapeOpen(false);
                            }}
                          >
                            {option}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Row 4: Case Size | Made In */}
                <Box className="mypage-add-watch-row">
                  <Box className="mypage-add-watch-field mypage-add-watch-field-case-size">
                    <Typography className="mypage-add-watch-label">
                      Case Size
                    </Typography>
                    <Box
                      className="mypage-add-watch-input-with-arrow"
                      onClick={() => setIsCaseSizeOpen((prev) => !prev)}
                    >
                      <input
                        type="text"
                        className="mypage-add-watch-input"
                        placeholder="Choose case size"
                        value={newWatch.caseSize}
                        readOnly
                      />
                      <ArrowDropDown className="mypage-add-watch-type-arrow" />
                    </Box>
                    {isCaseSizeOpen && (
                      <Box className="mypage-add-watch-type-dropdown">
                        {[
                          "28-32mm",
                          "33-36mm",
                          "37-40mm",
                          "41-44mm",
                          "45mm+",
                        ].map((option) => (
                          <Box
                            key={option}
                            className={`mypage-add-watch-type-option${
                              newWatch.caseSize === option
                                ? " mypage-add-watch-type-option-active"
                                : ""
                            }`}
                            onClick={() => {
                              setNewWatch((prev) => ({
                                ...prev,
                                caseSize: option,
                              }));
                              setIsCaseSizeOpen(false);
                            }}
                          >
                            {option}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>

                  <Box className="mypage-add-watch-field">
                    <Typography className="mypage-add-watch-label">
                      Made In
                    </Typography>
                    <input
                      type="text"
                      className="mypage-add-watch-input"
                      placeholder="Enter country of origin"
                      value={newWatch.madeIn}
                      onChange={(e) =>
                        setNewWatch((prev) => ({
                          ...prev,
                          madeIn: e.target.value,
                        }))
                      }
                    />
                  </Box>
                </Box>

                {/* Row 5: Data | Water Resistance */}
                <Box className="mypage-add-watch-row">
                  <Box className="mypage-add-watch-field">
                    <Typography className="mypage-add-watch-label">
                      Data
                    </Typography>
                    <input
                      type="text"
                      className="mypage-add-watch-input"
                      placeholder="Enter data"
                      value={newWatch.date}
                      onChange={(e) =>
                        setNewWatch((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                    />
                  </Box>

                  <Box className="mypage-add-watch-field">
                    <Typography className="mypage-add-watch-label">
                      Water Resistance
                    </Typography>
                    <input
                      type="text"
                      className="mypage-add-watch-input"
                      placeholder="Enter water resistance"
                      value={newWatch.waterResistance}
                      onChange={(e) =>
                        setNewWatch((prev) => ({
                          ...prev,
                          waterResistance: e.target.value,
                        }))
                      }
                    />
                  </Box>
                </Box>

                {/* Row 6: Availability | Material */}
                <Box className="mypage-add-watch-row">
                  <Box className="mypage-add-watch-field">
                    <Typography className="mypage-add-watch-label">
                      Availability
                    </Typography>
                    <input
                      type="text"
                      className="mypage-add-watch-input"
                      placeholder="Enter availability"
                      value={newWatch.availability}
                      onChange={(e) =>
                        setNewWatch((prev) => ({
                          ...prev,
                          availability: e.target.value,
                        }))
                      }
                    />
                  </Box>

                  <Box className="mypage-add-watch-field mypage-add-watch-field-material">
                    <Typography className="mypage-add-watch-label">
                      Material
                    </Typography>
                    <Box
                      className="mypage-add-watch-input-with-arrow"
                      onClick={() => setIsMaterialOpen((prev) => !prev)}
                    >
                      <input
                        type="text"
                        className="mypage-add-watch-input"
                        placeholder="Choose material"
                        value={newWatch.material}
                        readOnly
                      />
                      <ArrowDropDown className="mypage-add-watch-type-arrow" />
                    </Box>
                    {isMaterialOpen && (
                      <Box className="mypage-add-watch-type-dropdown">
                        {[
                          "Stainles Steel",
                          "Gold",
                          "Rose Gold",
                          "Titanium",
                          "Ceramic",
                          "Carbon",
                          "Leather",
                          "Rubber",
                        ].map((option) => (
                          <Box
                            key={option}
                            className={`mypage-add-watch-type-option${
                              newWatch.material === option
                                ? " mypage-add-watch-type-option-active"
                                : ""
                            }`}
                            onClick={() => {
                              setNewWatch((prev) => ({
                                ...prev,
                                material: option,
                              }));
                              setIsMaterialOpen(false);
                            }}
                          >
                            {option}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Last row: Limited Edition + Description full width */}
                <Box className="mypage-add-watch-field mypage-add-watch-field-full">
                  <Typography className="mypage-add-watch-label">
                    Description
                  </Typography>
                  <textarea
                    className="mypage-add-watch-input"
                    placeholder="Enter description"
                    value={newWatch.description}
                    onChange={(e) =>
                      setNewWatch((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                  <Box className="mypage-add-watch-limited">
                    <Box
                      onClick={() =>
                        setNewWatch((prev) => ({
                          ...prev,
                          limitedEdition: !prev.limitedEdition,
                        }))
                      }
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        cursor: "pointer",
                      }}
                    >
                      <Typography
                        className="mypage-add-watch-label"
                        sx={{ userSelect: "none", marginTop: "20px" }}
                      >
                        Limited Edition
                      </Typography>
                      <Checkbox
                        checked={newWatch.limitedEdition}
                        onChange={(e) =>
                          setNewWatch((prev) => ({
                            ...prev,
                            limitedEdition: e.target.checked,
                          }))
                        }
                        sx={{
                          padding: "4px",
                          marginTop: "20px",
                          "&.Mui-checked": { color: "#000000" },
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box className="mypage-add-watch-footer">
                <Button
                  className="mypage-add-watch-submit-button"
                  disabled={!isAddWatchValid || createWatchLoading}
                  onClick={async () => {
                    if (!isAddWatchValid) return;
                    const files = [newWatch.image1, newWatch.image2].filter(
                      (x): x is File => x != null
                    );
                    if (files.length === 0) {
                      sweetMixinErrorAlert("Please add at least one image.");
                      return;
                    }
                    try {
                      const { data: uploadData } = await imagesUploaderMutation({
                        variables: { files, target: "watch" },
                      });
                      const urls = uploadData?.imagesUploader;
                      if (!urls?.length) {
                        sweetMixinErrorAlert("Image upload failed.");
                        return;
                      }
                      const watchTypeMap: Record<string, WatchTypeEnum> = {
                        Men: WatchTypeEnum.MEN,
                        Women: WatchTypeEnum.WOMEN,
                        Unisex: WatchTypeEnum.UNISEX,
                        Sport: WatchTypeEnum.ELITE_SPORT,
                      };
                      const watchTypeEnum =
                        watchTypeMap[newWatch.watchType] ?? WatchTypeEnum.UNISEX;
                      // GraphQL WatchType enum uses ELITE_SPORT (underscore), not ELITE-SPORT
                      const watchTypeForApi =
                        watchTypeEnum === WatchTypeEnum.ELITE_SPORT
                          ? "ELITE_SPORT"
                          : watchTypeEnum;
                      createWatchMutation({
                        variables: {
                          input: {
                            watchImages: urls,
                            watchModelName: newWatch.modelName,
                            watchType: watchTypeForApi,
                            watchPrice: parsePrice(newWatch.price),
                            watchLimitedEdition: newWatch.limitedEdition,
                            watchBrand: newWatch.watchBrand || undefined,
                            watchColor: newWatch.color || undefined,
                            watchCaseShape: newWatch.caseShape || undefined,
                            watchCaseSize: newWatch.caseSize || undefined,
                            watchCountry: newWatch.madeIn || undefined,
                            watchMakeData: newWatch.date || undefined,
                            watchWaterResistance: newWatch.waterResistance
                              ? Number(newWatch.waterResistance)
                              : undefined,
                            watchAvailability: newWatch.availability
                              ? Number(newWatch.availability)
                              : undefined,
                            watchMaterial: newWatch.material || undefined,
                            watchDescription: newWatch.description || undefined,
                          },
                        },
                      });
                    } catch {
                      // imagesUploaderMutation onError already shows alert
                    }
                  }}
                >
                  {createWatchLoading ? "Adding…" : "Add Watch"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {isAddArticleOpen && (
        <Box className="mypage-edit-profile-modal">
          <Box
            className="mypage-edit-profile-modal-overlay"
            onClick={() => setIsAddArticleOpen(false)}
          />
          <Box className="mypage-edit-profile-modal-content">
            <Box className="mypage-edit-profile-modal-header">
              <Typography className="mypage-edit-profile-modal-title">
                Add Article
              </Typography>
              <Button
                className="mypage-edit-profile-modal-close"
                onClick={() => setIsAddArticleOpen(false)}
              >
                <Close />
              </Button>
            </Box>

            <Box className="mypage-add-article-form">
              <Box className="mypage-add-article-photo-section">
                <Typography className="mypage-add-article-label">
                  Article Image
                </Typography>
                <Box className="mypage-add-article-photo-row">
                  <Box className="mypage-edit-profile-photo-wrapper">
                    <Box className="mypage-edit-profile-photo-placeholder">
                      {newArticleImagePreview || newArticle.image ? (
                        <img
                          src={newArticleImagePreview || newArticle.image || ""}
                          alt="Article"
                          className="mypage-edit-profile-photo"
                        />
                      ) : (
                        <PersonOutline className="mypage-edit-profile-photo-icon" />
                      )}
                    </Box>
                    {(newArticleImagePreview || newArticle.image) && (
                      <Button
                        className="mypage-edit-profile-photo-cancel"
                        onClick={() => {
                          if (newArticleImagePreview) {
                            URL.revokeObjectURL(newArticleImagePreview);
                            setNewArticleImagePreview(null);
                          }
                          setNewArticleImageFile(null);
                          setNewArticle((prev) => ({ ...prev, image: null }));
                        }}
                      >
                        <Delete />
                      </Button>
                    )}
                  </Box>
                  <Box className="mypage-add-article-photo-actions">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      style={{ display: "none" }}
                      id="mypage-add-article-image"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (newArticleImagePreview)
                            URL.revokeObjectURL(newArticleImagePreview);
                          setNewArticleImageFile(file);
                          setNewArticleImagePreview(URL.createObjectURL(file));
                        }
                        e.target.value = "";
                      }}
                    />
                    <Button
                      className="mypage-edit-profile-upload-button"
                      onClick={() => {
                        const input = document.getElementById(
                          "mypage-add-article-image"
                        ) as HTMLInputElement | null;
                        input?.click();
                      }}
                    >
                      Upload Article Image
                    </Button>
                    <Typography className="mypage-edit-profile-photo-hint">
                      A photo must be in JPG, JPEG or PNG format!
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box className="mypage-add-article-field">
                <Typography className="mypage-add-article-label">
                  Article Title
                </Typography>
                <input
                  type="text"
                  className="mypage-add-article-input"
                  placeholder="Enter article title"
                  value={newArticle.title}
                  onChange={(e) =>
                    setNewArticle((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </Box>

              <Box className="mypage-add-article-field">
                <Typography className="mypage-add-article-label">
                  Article Content
                </Typography>
                <textarea
                  className="mypage-add-article-input mypage-add-article-content"
                  placeholder="Enter article content"
                  value={newArticle.content}
                  onChange={(e) =>
                    setNewArticle((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                />
              </Box>

              <Box className="mypage-add-article-field">
                <Typography className="mypage-add-article-label">
                  Article Type
                </Typography>
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  gap={3}
                  sx={{ alignItems: "center", marginTop: 0.5 }}
                >
                  {(["Free Board", "Recommendation", "News"] as const).map(
                    (type) => (
                      <Box
                        key={type}
                        onClick={() =>
                          setNewArticle((prev) => ({
                            ...prev,
                            articleType:
                              newArticle.articleType === type ? "" : type,
                          }))
                        }
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          cursor: "pointer",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#000000",
                            fontSize: 17,
                            userSelect: "none",
                            fontFamily:
                              "'Helvetica Neue', Helvetica, Arial, sans-serif",
                          }}
                        >
                          {type}
                        </Typography>
                        <Checkbox
                          checked={newArticle.articleType === type}
                          onChange={() =>
                            setNewArticle((prev) => ({
                              ...prev,
                              articleType:
                                newArticle.articleType === type ? "" : type,
                            }))
                          }
                          sx={{
                            padding: "4px",
                            "&.Mui-checked": { color: "#000000" },
                          }}
                        />
                      </Box>
                    )
                  )}
                </Stack>
              </Box>

              <Box className="mypage-edit-profile-footer">
                <Button
                  className="mypage-edit-profile-update-button"
                  disabled={
                    !newArticle.title?.trim() ||
                    !newArticle.content?.trim() ||
                    !newArticle.articleType ||
                    createArticleLoading
                  }
                  onClick={async () => {
                    const articleCategoryMap: Record<string, BoardArticleCategory> = {
                      "Free Board": BoardArticleCategory.FREE,
                      Recommendation: BoardArticleCategory.RECOMMEND,
                      News: BoardArticleCategory.NEWS,
                    };
                    const category = articleCategoryMap[newArticle.articleType];
                    if (!category) {
                      sweetMixinErrorAlert("Please select article type.");
                      return;
                    }
                    let articleImageUrl: string | undefined;
                    if (newArticleImageFile) {
                      try {
                        const { data } = await imageUploaderMutation({
                          variables: {
                            file: newArticleImageFile,
                            target: "article",
                          },
                        });
                        if (data?.imageUploader) articleImageUrl = data.imageUploader;
                        if (newArticleImagePreview)
                          URL.revokeObjectURL(newArticleImagePreview);
                        setNewArticleImagePreview(null);
                        setNewArticleImageFile(null);
                      } catch {
                        return;
                      }
                    }
                    try {
                      await createBoardArticleMutation({
                        variables: {
                          input: {
                            articleCategory: category,
                            articleTitle: newArticle.title.trim(),
                            articleContent: newArticle.content.trim(),
                            ...(articleImageUrl && { articleImage: articleImageUrl }),
                          },
                        },
                      });
                      setNewArticle({
                        image: null,
                        title: "",
                        content: "",
                        articleType: "",
                      });
                      setNewArticleImagePreview(null);
                      setNewArticleImageFile(null);
                      setIsAddArticleOpen(false);
                    } catch {
                      // error already shown by mutation onError
                    }
                  }}
                >
                  Add Article
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Stack>
  );

  return pageContent;
};

export default withLayoutBasic(MyPage);
