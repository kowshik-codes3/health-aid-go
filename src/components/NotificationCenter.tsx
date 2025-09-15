import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Eye, Heart, Mic, CheckCircle, AlertTriangle, Calendar, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  scan_id: string | null;
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          toast({
            title: "New Notification",
            description: (payload.new as Notification).title,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is patient or doctor
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (patient) {
        query = query.eq('recipient_type', 'patient').eq('recipient_id', patient.id);
      } else if (doctor) {
        query = query.eq('recipient_type', 'doctor').eq('recipient_id', doctor.id);
      } else {
        return; // User is neither patient nor doctor
      }

      const { data, error } = await query;
      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notifications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );

      toast({
        title: "Success",
        description: "All notifications marked as read.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read.",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'anomaly_detected': return AlertTriangle;
      case 'appointment_suggestion': return Calendar;
      case 'scan_complete': return CheckCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'anomaly_detected': return 'text-red-600 bg-red-50';
      case 'appointment_suggestion': return 'text-blue-600 bg-blue-50';
      case 'scan_complete': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScanIcon = (scanId: string | null) => {
    // This would need to be enhanced to fetch scan type from scan_id
    return Bell; // Default for now
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <div>
            <h2 className="text-2xl font-bold">Notifications</h2>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
            <p className="text-muted-foreground">
              You'll receive notifications here when scans are completed or anomalies are detected.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.notification_type);
            const colorClass = getNotificationColor(notification.notification_type);
            
            return (
              <Card 
                key={notification.id}
                className={`transition-all hover:shadow-md cursor-pointer ${
                  !notification.is_read ? 'border-l-4 border-l-primary bg-blue-50/30' : ''
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold">{notification.title}</h4>
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      
                      {notification.notification_type === 'anomaly_detected' && (
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View Results
                          </Button>
                          <Button size="sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            Book Appointment
                          </Button>
                        </div>
                      )}
                      
                      {notification.notification_type === 'appointment_suggestion' && (
                        <div className="flex gap-2 pt-2">
                          <Button size="sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            Book Now
                          </Button>
                          <Button size="sm" variant="outline">
                            View Doctors
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};