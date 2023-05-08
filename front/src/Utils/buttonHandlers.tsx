import axios from 'axios';
import { toast } from "react-toastify";

export const handleInvite = async (uuid : string | undefined) => {
  // Send friend request
  return axios
    .post(
      `http://localhost:3300/friends/add/`,
      { id : uuid },
      { withCredentials: true }
    )
    .then(() => {
      toast.success("Friend request sent successfully!");
      return true;
    })
    .catch((err) => {
      toast.error(err.response.data.message);
      return false;
    });
};

export const handleAccept = async (uuid : string | undefined) => {
  // Accept friend request
  return axios
    .post(
      `http://localhost:3300/friends/accept/`,
      { id : uuid },
      { withCredentials: true }
    )
    .then((response) => {
      console.log('response.data')
      console.log(response.data)
      toast.success("Friend request accepted");
      return true;
    })
    .catch((err) => {
      toast.error(err.response.data.message);
      return false;
    });
};

export const handleReject = async (uuid : string | undefined) => {
  // Reject friend request
  return axios
    .post(
      `http://localhost:3300/friends/reject/`,
      { id : uuid },
      { withCredentials: true }
    )
    .then(() => {
      toast.success("Friend request rejected");
      return true;
    })
    .catch((err) => {
      toast.error(err.response.data.message);
      return false;
    });
};

export const handleRemove = async (uuid : string | undefined) => {
  return axios
    .delete(`http://localhost:3300/friends/`,{
      data : { id : uuid } ,
      withCredentials: true
    })
    .then(() => {      
      toast.success("Friend removed successfully");
      return true;
    })
    .catch((err) => {
      toast.error(err.response.data.message);
      return false;
    });
};

export const handleCancel = async (uuid : string | undefined) => {
  console.log('canceling or trying to')
  return axios
    .post(
      `http://localhost:3300/friends/cancel/`,
      { id : uuid },
      { withCredentials: true }
    )
    .then((res) => {
      if (!res.data.success){
        toast.error(res.data.msg);
        return false;
      }
      toast.success("Invitation canceled successfully!");
      return true;
    })
    .catch((err) => {
      toast.error(err.response.data.message);
      return false;
    });
};

export const handleBlock = async (uuid : string | undefined) => {
  // Block user
  return axios
    .post(
      `http://localhost:3300/friends/block/`,
      { id : uuid },
      { withCredentials: true }
    )
    .then(() => {
      toast.success("User blocked successfully!");
      return true;
    })
    .catch((err) => {
      toast.error(err.response.data.message);
      return false;
    });
};
export const handleUnblock = async (uuid : string | undefined) => {
  return axios
    .post(
      `http://localhost:3300/friends/unblock/`,
      { id : uuid },
      { withCredentials: true }
    )
    .then(() => {
      toast.success("User unblocked successfully!");
      return true;
    })
    .catch((err) => {
      toast.error(err.response.data.message);
      return false;
    });
};