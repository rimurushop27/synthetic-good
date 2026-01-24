
// Ensure config is loaded
if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    alert("Configuration missing. Please check config.js");
}

const supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// DOM Elements
const views = {
    login: document.getElementById('login-view'),
    upload: document.getElementById('upload-view'),
    success: document.getElementById('success-view'),
    loading: document.getElementById('loading'),
    loadingText: document.getElementById('loading-text')
};

const forms = {
    login: document.getElementById('login-form'),
    upload: document.getElementById('upload-form')
};

const inputs = {
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    image: document.getElementById('image-file'),
    preview: document.getElementById('image-preview'),
    category: document.getElementById('category'),
    primaryTag: document.getElementById('primary-tag'),
    title: document.getElementById('title'),
    prompt: document.getElementById('prompt')
};

// --- Initialization ---

async function init() {
    // Populate Categories
    window.APP_CONFIG.categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        inputs.category.appendChild(option);
    });

    // Check Session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        checkAdmin(session.user.id);
    } else {
        showView('login');
    }
}

// --- Auth Functions ---

async function handleLogin(e) {
    e.preventDefault();
    setLoading(true, "Authenticating...");
    document.getElementById('login-error').classList.add('hidden');

    const email = inputs.email.value;
    const password = inputs.password.value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        setLoading(false);
        const errEl = document.getElementById('login-error');
        errEl.textContent = error.message;
        errEl.classList.remove('hidden');
        return;
    }

    await checkAdmin(data.user.id);
}

async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
}

async function checkAdmin(uid) {
    setLoading(true, "Verifying Admin Status...");
    
    // Call RPC function is_admin()
    const { data: isAdmin, error } = await supabase.rpc('is_admin');

    setLoading(false);

    if (isAdmin) {
        showView('upload');
    } else {
        alert("Access Denied: You are not an admin.");
        await supabase.auth.signOut();
        showView('login');
    }
}

// --- Upload Logic ---

// Image Preview
inputs.image.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            inputs.preview.src = e.target.result;
            inputs.preview.classList.remove('hidden');
        }
        reader.readAsDataURL(file);
    }
});

function generateSlug() {
    // Generate 6 character random string (lowercase alphanumeric)
    return Math.random().toString(36).substring(2, 8);
}

async function handleUpload(e) {
    e.preventDefault();
    setLoading(true, "Preparing...");

    const file = inputs.image.files[0];
    if (!file) {
        alert("Please select an image");
        setLoading(false);
        return;
    }

    try {
        // 1. Generate Slug
        let slug = generateSlug();
        const primaryTag = inputs.primaryTag.value;
        const tagSlug = primaryTag.replace(/\s+/g, '-');

        // 2. Upload Image
        setLoading(true, "Uploading Image...");
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        
        const filePath = `posts/${year}/${month}/${timestamp}-${slug}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('post-images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 3. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('post-images')
            .getPublicUrl(filePath);

        // 4. Insert Record
        setLoading(true, "Publishing Post...");
        
        const tags = ["ai prompt", "image prompt", primaryTag];

        const postData = {
            title: inputs.title.value || "Untitled",
            image_url: publicUrl,
            prompt: inputs.prompt.value,
            category: inputs.category.value,
            primary_tag: primaryTag,
            tags: tags,
            creator: window.APP_CONFIG.defaultCreator,
            creator_url: window.APP_CONFIG.defaultCreatorUrl,
            slug: slug,
            // created_at is default now()
            // like_count, use_count default 0
        };

        const { error: dbError } = await supabase
            .from('posts')
            .insert([postData]);

        if (dbError) throw dbError;

        // 5. Success
        setLoading(false);
        showSuccess(tagSlug, slug);

    } catch (error) {
        console.error(error);
        setLoading(false);
        alert("Error: " + error.message);
    }
}

// --- UI Helpers ---

function setLoading(isLoading, text = "Loading...") {
    if (isLoading) {
        views.loadingText.textContent = text;
        views.loading.classList.remove('hidden');
        views.loading.classList.add('flex');
    } else {
        views.loading.classList.add('hidden');
        views.loading.classList.remove('flex');
    }
}

function showView(viewName) {
    views.login.classList.add('hidden');
    views.upload.classList.add('hidden');
    
    if (viewName === 'login') views.login.classList.remove('hidden');
    if (viewName === 'upload') views.upload.classList.remove('hidden');
}

function showSuccess(tagSlug, slug) {
    document.getElementById('success-view').classList.remove('hidden');
    forms.upload.classList.add('opacity-50', 'pointer-events-none');
    
    // Change link to use new URL format
    const link = document.getElementById('new-post-link');
    link.href = `/${tagSlug}/${slug}`;
    
    document.getElementById('reset-btn').onclick = () => {
        forms.upload.reset();
        inputs.preview.classList.add('hidden');
        inputs.preview.src = "";
        
        document.getElementById('success-view').classList.add('hidden');
        forms.upload.classList.remove('opacity-50', 'pointer-events-none');
    };
}

// --- Event Listeners ---

forms.login.addEventListener('submit', handleLogin);
forms.upload.addEventListener('submit', handleUpload);
document.getElementById('logout-btn').addEventListener('click', handleLogout);

// Start
init();
