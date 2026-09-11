const token =
    localStorage.getItem("token");


const grid =
    document.getElementById("destinationGrid");


// Show/hide login-only controls. Browsing the list itself
// never requires login.

if (token) {

    // logged-in state is already reflected in the nav bar

} else {

    document.getElementById("addDestinationLink").style.display = "none";
    document.getElementById("loginNotice").style.display = "block";

}


const ICONS = {

    heart: `<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.5 8.2 2 4.5 5.6 3.8c2-.4 3.9.4 5 2.1 1.1-1.7 3-2.5 5-2.1 3.6.7 5.1 4.4 3.6 7.9C19.5 16.4 12 21 12 21z"/></svg>`,

    comment: `<svg viewBox="0 0 24 24"><path d="M21 12c0 4.4-4 8-9 8-1.3 0-2.5-.2-3.6-.6L3 21l1.4-4.1C3.5 15.6 3 13.9 3 12c0-4.4 4-8 9-8s9 3.6 9 8z"/></svg>`,

    share: `<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><line x1="8.2" y1="10.8" x2="15.8" y2="6.2"/><line x1="8.2" y1="13.2" x2="15.8" y2="17.8"/></svg>`
};


function loadDestinations(searchTerm) {

    const url = searchTerm
        ? `/api/destinations/?search=${encodeURIComponent(searchTerm)}`
        : "/api/destinations/";

    const headers = { "Content-Type": "application/json" };

    if (token) {
        headers["Authorization"] = "Token " + token;
    }

    fetch(url, { method: "GET", headers })

    .then(response => response.json())

    .then(data => {

        grid.innerHTML = "";

        if (!data.length) {

            grid.innerHTML =
                `<p class="empty-state">${
                    searchTerm
                        ? "No destinations match your search."
                        : "No destinations shared yet &mdash; be the first to add one!"
                }</p>`;

            return;
        }

        data.forEach(renderCard);

    });

}


function renderCard(destination) {

    const card = document.createElement("div");
    card.className = "destination-card";

    const photosHtml = destination.photos.length
        ? destination.photos.map(
              p => `<img src="${p.image}" alt="${destination.place_name}">`
          ).join("")
        : "";

    const ownerActionsHtml = destination.is_owner
        ? `
            <div class="owner-actions">
                <button class="btn-text" onclick="editDestination(${destination.id})">
                    Edit
                </button>
                <button class="btn-danger" onclick="deleteDestination(${destination.id})">
                    Delete
                </button>
            </div>
        `
        : "";

    // Visitor info, like/share/comment actions and the comment
    // panel only render for logged-in users - the API already
    // hides visitor_info/comments from anonymous responses, and
    // liking/sharing/commenting requires a token too.

    const visitorInfoHtml = (token && destination.visitor_info) ? `
        <details class="visitor-info">
            <summary>Visitor Information</summary>
            <p>${escapeHtml(destination.visitor_info)}</p>
        </details>
    ` : "";

    const actionRowHtml = token ? `
        <div class="action-row">

            <button class="icon-btn like-btn ${destination.liked_by_user ? 'liked' : ''}"
                    onclick="toggleLike(${destination.id}, this)">
                ${ICONS.heart}
                <span class="like-count">${destination.likes_count}</span>
            </button>

            <button class="icon-btn" onclick="toggleComments(${destination.id})">
                ${ICONS.comment}
                <span>${destination.comments.length}</span>
            </button>

            <button class="icon-btn" onclick="shareDestination(${destination.id}, this)">
                ${ICONS.share}
                <span class="share-count">${destination.shares_count}</span>
            </button>

            ${ownerActionsHtml}

        </div>

        <div class="comments-panel" id="comments-${destination.id}">

            <div class="comment-list" id="comment-list-${destination.id}">
                ${renderComments(destination.comments)}
            </div>

            <form class="comment-form" onsubmit="return submitComment(event, ${destination.id})">
                <input type="text" placeholder="Add a comment..." required>
                <button type="submit">Post</button>
            </form>

        </div>
    ` : `
        <div class="action-row">
            <span class="like-count-readonly">
                ${ICONS.heart}${destination.likes_count}
            </span>
            <span class="hint" style="margin-left:8px;">
                <a href="/login/">Login</a> to like, comment or share
            </span>
        </div>
    `;

    card.innerHTML = `

        <div class="photo-strip ${photosHtml ? '' : 'empty'}">
            ${photosHtml || 'No photos yet'}
        </div>

        <div class="card-body">

            <p class="owner-line">Shared by ${destination.owner_username || 'a traveller'}</p>

            <h3>${escapeHtml(destination.place_name)}</h3>

            <div class="tag-row">
                <span class="tag">${escapeHtml(destination.weather)}</span>
                <span class="tag">${escapeHtml(destination.location)}</span>
            </div>

            <p class="description">${escapeHtml(destination.description)}</p>

            ${visitorInfoHtml}

            <a href="${destination.google_map_link}" target="_blank">
                View on Google Maps &rarr;
            </a>

        </div>

        ${actionRowHtml}
    `;

    grid.appendChild(card);
}


function renderComments(comments) {

    if (!comments.length) {
        return '<p class="hint">No comments yet.</p>';
    }

    return comments.map(c => `
        <div class="comment-item" id="comment-item-${c.id}">
            <span class="comment-user">${c.username}</span>
            <span class="comment-text">${escapeHtml(c.text)}</span>
            <div class="comment-meta">
                <span class="comment-time">
                    ${new Date(c.created_at).toLocaleString()}
                </span>
                ${c.can_modify ? `
                    <span class="comment-actions">
                        <button class="btn-text" onclick="editComment(${c.id})">Edit</button>
                        <button class="btn-danger" onclick="deleteComment(${c.id})">Delete</button>
                    </span>
                ` : ""}
            </div>
        </div>
    `).join("");

}


function escapeHtml(text) {

    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}


function toggleComments(id) {

    const panel = document.getElementById(`comments-${id}`);
    panel.classList.toggle("open");
}


function toggleLike(id, button) {

    fetch(`/api/destinations/${id}/like/`, {

        method: "POST",

        headers: {
            "Authorization": "Token " + token
        }

    })

    .then(response => response.json())

    .then(data => {

        button.classList.toggle("liked", data.liked);
        button.querySelector(".like-count").textContent = data.likes_count;

    })

    .catch(() => alert("Couldn't update like right now."));

}


function shareDestination(id, button) {

    const url = `${window.location.origin}/destinations/`;

    fetch(`/api/destinations/${id}/share/`, {

        method: "POST",

        headers: {
            "Authorization": "Token " + token
        }

    })

    .then(response => response.json())

    .then(data => {

        button.querySelector(".share-count").textContent = data.shares_count;

        if (navigator.share) {

            navigator.share({
                title: "Check out this destination!",
                url: url
            }).catch(() => {});

        } else {

            navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");

        }

    })

    .catch(() => alert("Couldn't share right now."));

}


function submitComment(event, id) {

    event.preventDefault();

    const input = event.target.querySelector("input");
    const text = input.value.trim();

    if (!text) return false;

    fetch(`/api/destinations/${id}/comments/`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": "Token " + token
        },

        body: JSON.stringify({ text })

    })

    .then(response => {

        if (!response.ok) throw new Error("Comment failed");

        input.value = "";

        const currentSearch = document.getElementById("searchInput").value.trim();
        loadDestinations(currentSearch);

    })

    .catch(() => alert("Couldn't post your comment right now."));

    return false;
}


function editComment(commentId) {

    const item = document.getElementById(`comment-item-${commentId}`);
    const currentText = item.querySelector(".comment-text").textContent;

    const newText = prompt("Edit your comment:", currentText);

    if (newText === null || newText.trim() === "") return;

    fetch(`/api/comments/${commentId}/`, {

        method: "PATCH",

        headers: {
            "Content-Type": "application/json",
            "Authorization": "Token " + token
        },

        body: JSON.stringify({ text: newText.trim() })

    })

    .then(response => {

        if (!response.ok) throw new Error("Edit failed");

        const currentSearch = document.getElementById("searchInput").value.trim();
        loadDestinations(currentSearch);

    })

    .catch(() => alert("Couldn't update your comment right now."));

}


function deleteComment(commentId) {

    if (!confirm("Delete this comment?")) return;

    fetch(`/api/comments/${commentId}/`, {

        method: "DELETE",

        headers: {
            "Authorization": "Token " + token
        }

    })

    .then(response => {

        if (!response.ok && response.status !== 204) {
            throw new Error("Delete failed");
        }

        const currentSearch = document.getElementById("searchInput").value.trim();
        loadDestinations(currentSearch);

    })

    .catch(() => alert("Couldn't delete that comment right now."));

}


function editDestination(id) {

    window.location.href =
        "/edit-destination/" + id + "/";
}


function deleteDestination(id) {

    if (
        confirm(
            "Are you sure you want to delete this destination?"
        )
    ) {

        fetch(
            "/api/destinations/" + id + "/",
            {

                method: "DELETE",

                headers: {

                    "Authorization":
                        "Token " + token

                }

            }
        )

        .then(response => {

            if (response.ok) {

                alert(
                    "Destination Deleted Successfully"
                );

                loadDestinations();

            } else if (response.status === 403) {

                alert("You can only delete your own destinations.");

            } else {

                alert("Delete Failed");

            }

        })

        .catch(error => {

            console.error(error);

            alert("Delete Failed");

        });

    }

}


// Search wiring

document.getElementById("searchBtn").addEventListener("click", () => {
    loadDestinations(document.getElementById("searchInput").value.trim());
});

document.getElementById("searchInput").addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        loadDestinations(e.target.value.trim());
    }
});

document.getElementById("clearSearchBtn").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    loadDestinations();
});


loadDestinations();
