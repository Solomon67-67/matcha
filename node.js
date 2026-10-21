/* ==========================================
   Catch Shared Application Logic
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Render Top Right Header Avatar
    updateHeaderAvatar();

    // Onboarding Guard
    const currentUser = JSON.parse(localStorage.getItem("catch_current_user"));
    const currentPage = window.location.pathname.split("/").pop();

    const protectedPages = ["find.html", "chat.html", "profile.html"];
    if (protectedPages.includes(currentPage) && !currentUser) {
        alert("Please complete registration to explore, chat, and access your profile.");
        window.location.href = "start.html";
        return;
    }

    // Handlers
    if (currentPage === "start.html" || document.getElementById("signup-form")) setupRegistration();
    if (currentPage === "profile.html") setupProfileHub();
    if (currentPage === "find.html") setupDiscovery();
});

function updateHeaderAvatar() {
    const user = JSON.parse(localStorage.getItem("catch_current_user"));
    const headerAvatar = document.getElementById("header-avatar");
    if (!headerAvatar) return;

    if (user && user.photoUrl) {
        headerAvatar.innerHTML = `<img src="${user.photoUrl}" alt="Avatar">`;
    } else if (user && user.name) {
        headerAvatar.innerHTML = `<span>${user.name.charAt(0).toUpperCase()}</span>`;
    } else {
        headerAvatar.innerHTML = `<span>U</span>`;
    }
}

function setupRegistration() {
    const signupForm = document.getElementById("signup-form");
    if (!signupForm) return;

    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("fullname").value;
        const age = document.getElementById("age").value;
        const locationVal = document.getElementById("location").value;
        const phone = document.getElementById("phone").value;
        const bio = document.getElementById("bio").value;
        const photoInput = document.getElementById("signup-photo");

        const processRegistration = (photoDataUrl) => {
            const userObj = {
                id: Date.now(),
                name,
                age,
                location: locationVal,
                phone,
                bio,
                photoUrl: photoDataUrl || null,
                tier: "Free Plan"
            };

            localStorage.setItem("catch_current_user", JSON.stringify(userObj));
            
            const publicPool = JSON.parse(localStorage.getItem("catch_uploaded_profiles")) || [];
            publicPool.push(userObj);
            localStorage.setItem("catch_uploaded_profiles", JSON.stringify(publicPool));

            alert("Profile created successfully!");
            window.location.href = "find.html";
        };

        if (photoInput.files && photoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (evt) => processRegistration(evt.target.result);
            reader.readAsDataURL(photoInput.files[0]);
        } else {
            processRegistration(null);
        }
    });
}

function setupProfileHub() {
    const user = JSON.parse(localStorage.getItem("catch_current_user"));
    if (!user) return;

    document.getElementById("user-display-name").textContent = `${user.name}, ${user.age}`;
    document.getElementById("user-display-location").textContent = `Location: ${user.location}`;
    document.getElementById("user-tier-badge").textContent = user.tier;

    const avatarBox = document.getElementById("profile-avatar-display");
    if (user.photoUrl) {
        avatarBox.innerHTML = `<img src="${user.photoUrl}" alt="Profile Photo">`;
    } else {
        const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";
        avatarBox.innerHTML = `<span id="avatar-initials">${initial}</span>`;
    }

    const savePhotoBtn = document.getElementById("btn-save-photo");
    if (savePhotoBtn) {
        savePhotoBtn.addEventListener("click", () => {
            const photoInput = document.getElementById("profile-photo-input");
            if (photoInput.files && photoInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    user.photoUrl = evt.target.result;
                    localStorage.setItem("catch_current_user", JSON.stringify(user));
                    alert("Profile photo updated successfully!");
                    location.reload();
                };
                reader.readAsDataURL(photoInput.files[0]);
            } else {
                alert("Please select an image file first.");
            }
        });
    }

    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Reset account data on this device?")) {
                localStorage.removeItem("catch_current_user");
                window.location.href = "index.html";
            }
        });
    }
}

function setupDiscovery() {
    const user = JSON.parse(localStorage.getItem("catch_current_user"));
    const requestBtn = document.getElementById("btn-message-request");

    if (requestBtn) {
        requestBtn.addEventListener("click", () => {
            if (!user.photoUrl) {
                alert("You need a profile photo before sending message requests! Please upload one on your profile page.");
                window.location.href = "profile.html";
                return;
            }
            alert("Message request sent!");
        });
    }
}
// 1. Email Sign-Up
async function signUpUser(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: { data: { full_name: fullName, plan: 'Free' } }
  });

  if (error) alert("Sign up error: " + error.message);
  else alert("Account created! Please check your email for confirmation.");
}

// 2. Email Sign-In
async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) alert("Login error: " + error.message);
  else window.location.href = "find.html"; // Redirect to feed
}

// 3. Google Sign-In
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/find.html'
    }
  });

  if (error) alert("Google Login error: " + error.message);
}