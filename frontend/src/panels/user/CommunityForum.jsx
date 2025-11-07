import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Grid,
  Container,
  Chip,
  IconButton,
  InputAdornment,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Collapse,
  Divider,
  Alert,
  Snackbar,
  Paper,
  Tab,
  Tabs,
  LinearProgress,
} from '@mui/material';
import {
  Send,
  Group,
  MoreVert,
  Reply,
  ThumbUp,
  ThumbUpOutlined,
  Share,
  Bookmark,
  BookmarkBorder,
  EmojiEmotions,
  AttachFile,
  Image,
  Notifications,
  NotificationsOff,
  TrendingUp,
  Forum,
  Delete,
  Edit,
  Report,
  Close,
  Search,
  FilterList,
  Sort,
  Add,
  Public,
  Lock,
  Verified,
  Schedule,
  Visibility,
} from '@mui/icons-material';

// Local Storage Database Functions
const getStoredData = (key, defaultValue = []) => {
  try {
    const stored = localStorage.getItem(`bluecarbon_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

const setStoredData = (key, data) => {
  try {
    localStorage.setItem(`bluecarbon_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

const CommunityForum = () => {
  // State Management
  const [newMessage, setNewMessage] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [messages, setMessages] = useState([]);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [userLikes, setUserLikes] = useState(getStoredData('user_likes', {}));
  const [userBookmarks, setUserBookmarks] = useState(getStoredData('user_bookmarks', {}));
  const [expandedReplies, setExpandedReplies] = useState({});

  // Initialize with sample data and load from localStorage
  useEffect(() => {
    const storedMessages = getStoredData('forum_messages', [
      {
        id: 1,
        user: 'Sarah Chen',
        avatar: 'SC',
        role: 'Environmental Scientist',
        message: 'Just completed my first blue carbon project verification! The mangrove restoration in Kerala is showing amazing results. 🌱 The carbon sequestration rates are exceeding our initial projections by 25%!',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        likes: 12,
        replies: [
          {
            id: 101,
            user: 'Dr. Raj Patel',
            avatar: 'RP',
            message: 'Congratulations Sarah! What methodology did you use for the verification?',
            timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
            likes: 3
          },
          {
            id: 102,
            user: 'Marine Biologist',
            avatar: 'MB',
            message: 'Amazing work! Kerala mangroves are crucial for coastal protection.',
            timestamp: new Date(Date.now() - 30 * 1000).toISOString(),
            likes: 2
          }
        ],
        category: 'verification',
        tags: ['mangroves', 'kerala', 'verification', 'carbon-sequestration'],
        isPublic: true,
        views: 156
      },
      {
        id: 2,
        user: 'Emma Thompson',
        avatar: 'ET',
        role: 'Marine Conservationist',
        message: 'Great article about blue carbon ecosystems! Did you know they can store 10x more carbon than forests? 🌊 Here\'s a link to the latest research: https://bluecarbon.org/research',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        likes: 8,
        replies: [
          {
            id: 201,
            user: 'Climate Researcher',
            avatar: 'CR',
            message: 'Thanks for sharing! The sediment carbon storage is particularly impressive.',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            likes: 1
          }
        ],
        category: 'research',
        tags: ['blue-carbon', 'research', 'carbon-storage'],
        isPublic: true,
        views: 89
      },
      {
        id: 3,
        user: 'Coastal Communities Initiative',
        avatar: 'CC',
        role: 'NGO Representative',
        message: 'Looking for partners for a seagrass restoration project in Tamil Nadu. We have funding secured and need technical expertise. Project timeline: 6 months. Expected impact: 500 hectares restored. 🌿',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        likes: 15,
        replies: [
          {
            id: 301,
            user: 'Tech Solutions',
            avatar: 'TS',
            message: 'We specialize in marine restoration tech. Would love to collaborate!',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            likes: 4
          },
          {
            id: 302,
            user: 'Local Fisherman',
            avatar: 'LF',
            message: 'Our community is very interested. How can we get involved?',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            likes: 6
          }
        ],
        category: 'collaboration',
        tags: ['seagrass', 'tamil-nadu', 'restoration', 'partnership'],
        isPublic: true,
        views: 234
      }
    ]);
    setMessages(storedMessages);
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      setStoredData('forum_messages', messages);
    }
  }, [messages]);

  // Save user interactions to localStorage
  useEffect(() => {
    setStoredData('user_likes', userLikes);
  }, [userLikes]);

  useEffect(() => {
    setStoredData('user_bookmarks', userBookmarks);
  }, [userBookmarks]);

  // Utility Functions
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const generateId = () => Date.now() + Math.random();

  // Event Handlers
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newPost = {
        id: generateId(),
        user: 'You',
        avatar: 'YU',
        role: 'Community Member',
        message: newMessage,
        timestamp: new Date().toISOString(),
        likes: 0,
        replies: [],
        category: 'general',
        tags: extractTags(newMessage),
        isPublic: true,
        views: 0
      };
      
      setMessages(prev => [newPost, ...prev]);
      setNewMessage('');
      setSnackbar({ 
        open: true, 
        message: 'Your post has been shared with the community!', 
        severity: 'success' 
      });
    }
  };

  const extractTags = (text) => {
    const hashtags = text.match(/#\w+/g) || [];
    const keywords = ['mangrove', 'seagrass', 'carbon', 'restoration', 'blue', 'climate'];
    const foundKeywords = keywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );
    return [...hashtags.map(tag => tag.slice(1)), ...foundKeywords];
  };

  const handleLike = (messageId, isReply = false, replyId = null) => {
    const likeKey = isReply ? `${messageId}_${replyId}` : messageId;
    const isLiked = userLikes[likeKey];
    
    setUserLikes(prev => ({
      ...prev,
      [likeKey]: !isLiked
    }));

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        if (isReply) {
          return {
            ...msg,
            replies: msg.replies.map(reply => 
              reply.id === replyId 
                ? { ...reply, likes: reply.likes + (isLiked ? -1 : 1) }
                : reply
            )
          };
        } else {
          return { ...msg, likes: msg.likes + (isLiked ? -1 : 1) };
        }
      }
      return msg;
    }));

    setSnackbar({ 
      open: true, 
      message: isLiked ? 'Like removed' : 'Post liked!', 
      severity: 'info' 
    });
  };

  const handleBookmark = (messageId) => {
    const isBookmarked = userBookmarks[messageId];
    setUserBookmarks(prev => ({
      ...prev,
      [messageId]: !isBookmarked
    }));
    
    setSnackbar({ 
      open: true, 
      message: isBookmarked ? 'Bookmark removed' : 'Post bookmarked!', 
      severity: 'info' 
    });
  };

  const handleReply = (message) => {
    setSelectedMessage(message);
    setReplyDialogOpen(true);
  };

  const handleSendReply = () => {
    if (replyText.trim() && selectedMessage) {
      const newReply = {
        id: generateId(),
        user: 'You',
        avatar: 'YU',
        message: replyText,
        timestamp: new Date().toISOString(),
        likes: 0
      };

      setMessages(prev => prev.map(msg => 
        msg.id === selectedMessage.id 
          ? { ...msg, replies: [...msg.replies, newReply] }
          : msg
      ));

      setReplyText('');
      setReplyDialogOpen(false);
      setSnackbar({ 
        open: true, 
        message: 'Reply posted successfully!', 
        severity: 'success' 
      });
    }
  };

  const handleShare = (message) => {
    if (navigator.share) {
      navigator.share({
        title: 'BlueCarbon Ledger Community Post',
        text: message.message,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${message.message}\n\n- Shared from BlueCarbon Ledger Community`);
      setSnackbar({ 
        open: true, 
        message: 'Post copied to clipboard!', 
        severity: 'success' 
      });
    }
  };

  const handleMenuOpen = (event, messageId) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMessageId(messageId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedMessageId(null);
  };

  const toggleReplies = (messageId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Filter and Sort Functions
  const getFilteredMessages = () => {
    let filtered = messages;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(msg => 
        msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(msg => msg.category === filterCategory);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        break;
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'replies':
        filtered.sort((a, b) => b.replies.length - a.replies.length);
        break;
      default:
        break;
    }

    return filtered;
  };

  const categories = [
    { value: 'all', label: 'All Posts', count: messages.length },
    { value: 'verification', label: 'Verification', count: messages.filter(m => m.category === 'verification').length },
    { value: 'research', label: 'Research', count: messages.filter(m => m.category === 'research').length },
    { value: 'collaboration', label: 'Collaboration', count: messages.filter(m => m.category === 'collaboration').length },
    { value: 'general', label: 'General', count: messages.filter(m => m.category === 'general').length }
  ];

  const trendingTags = [
    '#MangroveRestoration', '#SeagrassConservation', '#CarbonCredits', 
    '#CoastalProtection', '#SustainableFishing', '#BlueCarbon', 
    '#ClimateAction', '#MarineConservation'
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Forum color="primary" />
            🌍 Community Forum
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Connect with fellow environmental enthusiasts and share your carbon credit journey
          </Typography>
        </Box>

        {/* Search and Filter Bar */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search posts, users, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    size="small"
                  >
                    Filter
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Sort />}
                    size="small"
                    onClick={(e) => {
                      const nextSort = sortBy === 'newest' ? 'popular' : sortBy === 'popular' ? 'replies' : 'newest';
                      setSortBy(nextSort);
                    }}
                  >
                    {sortBy === 'newest' ? 'Newest' : sortBy === 'popular' ? 'Popular' : 'Most Replies'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Main Forum Feed */}
          <Grid item xs={12} md={8}>
            {/* New Post Card */}
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>YU</Avatar>
                  <Typography variant="h6">Share with the community</Typography>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Share your thoughts about blue carbon projects, ask questions, or start a discussion..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Add emoji">
                            <IconButton size="small">
                              <EmojiEmotions />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Attach file">
                            <IconButton size="small">
                              <AttachFile />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Add image">
                            <IconButton size="small">
                              <Image />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label="Blue Carbon" size="small" clickable />
                    <Chip label="Mangroves" size="small" clickable />
                    <Chip label="Community" size="small" clickable />
                    <Chip label="Research" size="small" clickable />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip 
                      icon={<Public />} 
                      label="Public" 
                      size="small" 
                      color="success" 
                      variant="outlined" 
                    />
                    <Button
                      variant="contained"
                      endIcon={<Send />}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      sx={{
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                      }}
                    >
                      Post
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Category Tabs */}
            <Paper sx={{ mb: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {categories.map((category, index) => (
                  <Tab 
                    key={category.value}
                    label={
                      <Badge badgeContent={category.count} color="primary">
                        {category.label}
                      </Badge>
                    }
                    onClick={() => setFilterCategory(category.value)}
                  />
                ))}
              </Tabs>
            </Paper>

            {/* Messages Feed */}
            <Box>
              {getFilteredMessages().length === 0 ? (
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Forum sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No posts found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery ? 'Try adjusting your search terms' : 'Be the first to start a conversation!'}
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                getFilteredMessages().map((msg) => (
                  <Card key={msg.id} sx={{ mb: 3, '&:hover': { boxShadow: 3 } }}>
                    <CardContent>
                      {/* Post Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          {msg.avatar}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {msg.user}
                            </Typography>
                            {msg.role && (
                              <Chip 
                                label={msg.role} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            )}
                            {msg.user !== 'You' && (
                              <Verified sx={{ fontSize: 16, color: 'primary.main' }} />
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimestamp(msg.timestamp)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Visibility sx={{ fontSize: 14 }} />
                              <Typography variant="caption" color="text.secondary">
                                {msg.views}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <IconButton 
                          size="small"
                          onClick={(e) => handleMenuOpen(e, msg.id)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>

                      {/* Post Content */}
                      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {msg.message}
                      </Typography>

                      {/* Tags */}
                      {msg.tags && msg.tags.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                          {msg.tags.map((tag, index) => (
                            <Chip 
                              key={index}
                              label={`#${tag}`} 
                              size="small" 
                              variant="outlined"
                              clickable
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      )}

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Button 
                          size="small" 
                          startIcon={userLikes[msg.id] ? <ThumbUp /> : <ThumbUpOutlined />}
                          onClick={() => handleLike(msg.id)}
                          color={userLikes[msg.id] ? 'primary' : 'inherit'}
                          sx={{ minWidth: 'auto' }}
                        >
                          {msg.likes}
                        </Button>
                        <Button 
                          size="small" 
                          startIcon={<Reply />}
                          onClick={() => handleReply(msg)}
                        >
                          Reply ({msg.replies.length})
                        </Button>
                        <Button 
                          size="small" 
                          startIcon={<Share />}
                          onClick={() => handleShare(msg)}
                        >
                          Share
                        </Button>
                        <IconButton 
                          size="small"
                          onClick={() => handleBookmark(msg.id)}
                          color={userBookmarks[msg.id] ? 'primary' : 'default'}
                        >
                          {userBookmarks[msg.id] ? <Bookmark /> : <BookmarkBorder />}
                        </IconButton>
                      </Box>

                      {/* Replies Section */}
                      {msg.replies.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Button
                            size="small"
                            onClick={() => toggleReplies(msg.id)}
                            sx={{ mb: 1 }}
                          >
                            {expandedReplies[msg.id] ? 'Hide' : 'Show'} {msg.replies.length} replies
                          </Button>
                          <Collapse in={expandedReplies[msg.id]}>
                            <Box sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                              {msg.replies.map((reply) => (
                                <Box key={reply.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.8rem' }}>
                                      {reply.avatar}
                                    </Avatar>
                                    <Typography variant="subtitle2" fontWeight="medium">
                                      {reply.user}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                      {formatTimestamp(reply.timestamp)}
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    {reply.message}
                                  </Typography>
                                  <Button 
                                    size="small" 
                                    startIcon={userLikes[`${msg.id}_${reply.id}`] ? <ThumbUp /> : <ThumbUpOutlined />}
                                    onClick={() => handleLike(msg.id, true, reply.id)}
                                    color={userLikes[`${msg.id}_${reply.id}`] ? 'primary' : 'inherit'}
                                  >
                                    {reply.likes}
                                  </Button>
                                </Box>
                              ))}
                            </Box>
                          </Collapse>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Community Stats */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Group color="primary" />
                  Community Stats
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Welcome to the BlueCarbon Ledger community! Share your environmental journey and connect with like-minded individuals.
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">1,247</Typography>
                      <Typography variant="caption">Members</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="success.main">89</Typography>
                      <Typography variant="caption">Online</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="info.main">{messages.length}</Typography>
                      <Typography variant="caption">Posts</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp color="primary" />
                  Trending Topics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {trendingTags.map((tag, index) => (
                    <Chip 
                      key={index}
                      label={tag} 
                      variant="outlined" 
                      clickable
                      onClick={() => setSearchQuery(tag.slice(1))}
                      sx={{ justifyContent: 'flex-start' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Add />}
                    onClick={() => setNewMessage('Looking for collaboration on ')}
                  >
                    Start Collaboration
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<Verified />}
                    onClick={() => setNewMessage('Just completed verification for ')}
                  >
                    Share Verification
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<Schedule />}
                    onClick={() => setNewMessage('Upcoming event: ')}
                  >
                    Announce Event
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {notifications ? <Notifications /> : <NotificationsOff />}
                      Notifications
                    </Box>
                  }
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Reply Dialog */}
        <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Reply to {selectedMessage?.user}
              <IconButton onClick={() => setReplyDialogOpen(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedMessage && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Original post:
                </Typography>
                <Typography variant="body2">
                  {selectedMessage.message.length > 100 
                    ? `${selectedMessage.message.substring(0, 100)}...` 
                    : selectedMessage.message}
                </Typography>
              </Box>
            )}
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Write your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSendReply}
              disabled={!replyText.trim()}
              endIcon={<Send />}
            >
              Reply
            </Button>
          </DialogActions>
        </Dialog>

        {/* Context Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <Edit sx={{ mr: 1 }} />
            Edit Post
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Report sx={{ mr: 1 }} />
            Report Post
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Delete sx={{ mr: 1 }} />
            Delete Post
          </MenuItem>
        </Menu>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default CommunityForum;