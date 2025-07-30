export const Notification = async () => {
  try {
    const res = await fetch('http://localhost:5000/Notification/allNotification', {
      method: 'GET',
      mode: 'cors',
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('We could not fetch your notifications at the moment');
    }

    const json = await res.json();
    console.log("Notification response:", json);

    return json || []; 
  } catch (err) {
    console.error("Error checking notifications:", err);
    return []; 
  }
};


export const markNotificationAsRead = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/Notification/MarkasRead${id}/read`, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return true;
  } catch (err) {
    console.error("Error marking notification as read:", err);
    throw err;
  }
};

export const deleteNotification = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/Notification/deleteNotification${id}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('Failed to delete notification');
    }

    return true;
  } catch (err) {
    console.error("Error deleting notification:", err);
    throw err;
  }
};
