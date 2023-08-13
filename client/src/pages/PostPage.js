import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { UserContext } from "../UserContext";
import { Link } from 'react-router-dom';

export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { userInfo } = useContext(UserContext);
  const { id } = useParams();

  useEffect(() => {
    fetch(`http://localhost:4000/post/${id}`)
      .then(response => response.json())
      .then(data => {
        setPostInfo(data.postDoc);
        setComments(data.comments)
      });
  }, [id]);

  const handleAddComment = () => {
    // Perform API call to add the new comment
    // After success, update the comments state
    const newCommentData = {
      postId: id,
      text: newComment,
    };

    fetch('http://localhost:4000/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCommentData),
      credentials: 'include',
    })
      .then(response => response.json())
      .then(newComment => {
        setComments([...comments, newComment]);
        setNewComment('');
      })
      .catch(error => {
        console.error(error);
      });
  };

  if (!postInfo) return '';

  return (
    <div className="post-page">
      <h1>{postInfo.title}</h1>
      <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
      <div className="author">by @{postInfo.author.username}</div>
      {userInfo.id === postInfo.author._id && (
        <div className="edit-row">
          <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
            {/* Edit button SVG */}
            Edit this post
          </Link>
        </div>
      )}
      <div className="image">
        <img src={`http://localhost:4000/${postInfo.cover}`} alt="" />
      </div>
      <div className="content" dangerouslySetInnerHTML={{ __html: postInfo.content }} />

      {/* Display comments */}
      <div className="comments">
        <h2>Comments</h2>
        <ul>
          {comments.map(comment => (
            <li key={comment._id}>
              <strong>@{comment.author.username}:</strong> {comment.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Add a new comment */}
      <div className="add-comment">
        <h3>Add a Comment</h3>
        <div className="comment-box"
        >
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Enter Comment..."
          ></input>
        </div>
        <button
        className="add-comment-button" onClick={handleAddComment}>Add Comment</button>
      </div>
    </div>
  );
}
