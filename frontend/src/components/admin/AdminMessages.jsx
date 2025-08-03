import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Search, 
  Filter, 
  Eye, 
  Archive, 
  Trash2,
  Reply,
  Clock,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  MailOpen,
  Menu,
  X
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const statusOptions = ['All', 'new', 'read', 'replied', 'archived'];
  const statusColors = {
    'new': 'bg-green-600',
    'read': 'bg-yellow-600', 
    'replied': 'bg-blue-600',
    'archived': 'bg-gray-600'
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getMessages();
      if (response.data.success) {
        const contactsData = response.data.data?.contacts || response.data.data;
        setMessages(Array.isArray(contactsData) ? contactsData : []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch messages.',
        variant: 'destructive',
      });
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      const response = await adminAPI.updateMessageStatus(messageId, newStatus);
      if (response.data.success) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, status: newStatus } : msg
        ));
        toast({
          title: 'Status Updated',
          description: `Message marked as ${newStatus}.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update message status.',
        variant: 'destructive',
      });
    }
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    
    if (message.status === 'new') {
      updateMessageStatus(message._id, 'read');
    }
  };

  const handleReply = (message) => {
    const subject = `Re: Message from ${message.name}`;
    const body = `Hi ${message.name},\n\nThank you for reaching out!\n\n\nBest regards,\nNaveen Agarwal`;
    const mailtoLink = `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.open(mailtoLink);
    updateMessageStatus(message._id, 'replied');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || message.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <AlertCircle className="h-4 w-4" />;
      case 'read': return <MailOpen className="h-4 w-4" />;
      case 'replied': return <Reply className="h-4 w-4" />;
      case 'archived': return <Archive className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4 md:space-y-6">
          <div className="h-6 md:h-8 bg-gray-700 rounded w-48 md:w-64"></div>
          <div className="space-y-3 md:space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 md:h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
            <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-green-400" />
            <span className="hidden sm:inline">Messages Management</span>
            <span className="sm:hidden">Messages</span>
          </h1>
          <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-base">
            Manage contact form submissions and inquiries.
          </p>
        </div>
      </div>

      {/* Stats - Mobile responsive grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-3 md:p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-white">{messages.length}</p>
            <p className="text-xs md:text-sm text-gray-400">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-3 md:p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-green-400">
              {messages.filter(m => m.status === 'new').length}
            </p>
            <p className="text-xs md:text-sm text-gray-400">New</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-3 md:p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-yellow-400">
              {messages.filter(m => m.status === 'read').length}
            </p>
            <p className="text-xs md:text-sm text-gray-400">Read</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-3 md:p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-blue-400">
              {messages.filter(m => m.status === 'replied').length}
            </p>
            <p className="text-xs md:text-sm text-gray-400">Replied</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Filters */}
      <Card className={`bg-gray-800 border-gray-700 ${showFilters || 'hidden md:block'}`}>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg text-white px-3 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status === 'All' ? 'All Messages' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 md:p-12 text-center">
            <MessageSquare className="h-8 w-8 md:h-12 md:w-12 text-gray-500 mx-auto mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-medium text-white mb-2">No messages found</h3>
            <p className="text-gray-400 text-sm md:text-base">
              {searchTerm || statusFilter !== 'All' 
                ? 'No messages match your search criteria.' 
                : 'No contact messages yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filteredMessages.map((message) => (
            <Card 
              key={message._id} 
              className={`bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors duration-200 cursor-pointer ${
                message.status === 'new' ? 'border-l-4 border-l-green-500' : ''
              }`}
              onClick={() => handleViewMessage(message)}
            >
              <CardContent className="p-3 md:p-4">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <div>
                        <h3 className={`font-medium text-sm ${message.status === 'new' ? 'text-white' : 'text-gray-300'}`}>
                          {message.name}
                        </h3>
                        <p className="text-xs text-gray-400">{message.email}</p>
                      </div>
                    </div>
                    <Badge 
                      className={`${statusColors[message.status]} text-white text-xs flex items-center gap-1`}
                    >
                      {getStatusIcon(message.status)}
                      {message.status}
                    </Badge>
                  </div>
                  
                  <p className={`text-sm line-clamp-2 ${message.status === 'new' ? 'text-gray-300' : 'text-gray-400'}`}>
                    {message.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(message.createdAt)}</span>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:bg-blue-400/20 h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReply(message);
                        }}
                      >
                        <Reply className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:bg-gray-600 h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateMessageStatus(message._id, 'archived');
                        }}
                      >
                        <Archive className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${message.status === 'new' ? 'text-white' : 'text-gray-300'}`}>
                          {message.name}
                        </h3>
                        <Badge 
                          className={`${statusColors[message.status]} text-white text-xs flex items-center gap-1`}
                        >
                          {getStatusIcon(message.status)}
                          {message.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-1">{message.email}</p>
                      <p className={`text-sm line-clamp-2 ${message.status === 'new' ? 'text-gray-300' : 'text-gray-400'}`}>
                        {message.message}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(message.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(message.createdAt).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:bg-blue-400/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReply(message);
                        }}
                      >
                        <Reply className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:bg-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateMessageStatus(message._id, 'archived');
                        }}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-700 p-4">
              <div>
                <CardTitle className="text-white text-lg">Message Details</CardTitle>
                <p className="text-gray-400 text-sm mt-1">
                  From {selectedMessage.name} • {formatDate(selectedMessage.createdAt)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-white h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Sender Info */}
              <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-700/30 rounded-lg">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium text-sm md:text-base">{selectedMessage.name}</h3>
                  <p className="text-gray-400 text-xs md:text-sm">{selectedMessage.email}</p>
                </div>
                <Badge 
                  className={`${statusColors[selectedMessage.status]} text-white flex items-center gap-1 text-xs`}
                >
                  {getStatusIcon(selectedMessage.status)}
                  {selectedMessage.status}
                </Badge>
              </div>

              {/* Message Content */}
              <div>
                <h4 className="text-white font-medium mb-3 text-sm md:text-base">Message:</h4>
                <div className="bg-gray-700/30 rounded-lg p-3 md:p-4">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Received</p>
                  <p className="text-white text-sm md:text-base">
                    {new Date(selectedMessage.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={selectedMessage.status}
                      onChange={(e) => {
                        updateMessageStatus(selectedMessage._id, e.target.value);
                        setSelectedMessage(prev => ({ ...prev, status: e.target.value }));
                      }}
                      className="bg-gray-700 border border-gray-600 rounded text-white px-2 py-1 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {statusOptions.slice(1).map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="border-t border-gray-700 p-3 md:p-4 flex flex-col sm:flex-row gap-2 md:gap-3">
              <Button
                onClick={() => handleReply(selectedMessage)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm"
              >
                <Reply className="h-4 w-4 mr-2" />
                Reply via Email
              </Button>
              <Button
                variant="outline"
                onClick={() => updateMessageStatus(selectedMessage._id, 'archived')}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 text-sm"
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowMessageModal(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 text-sm sm:hidden"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;