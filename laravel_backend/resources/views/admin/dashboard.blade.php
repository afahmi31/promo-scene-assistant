<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin Dashboard</title>
    <style>
        body {font-family: Arial, sans-serif; margin:0; padding:0; background:#f5f5f5;}
        .header {background:#333; color:#fff; padding:1rem; text-align:center;}
        .container {padding:2rem;}
        .card {background:#fff; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1); padding:1.5rem; margin-bottom:1rem;}
        .btn {background:#0066ff; color:#fff; border:none; padding:0.5rem 1rem; border-radius:4px; cursor:pointer;}
        .btn:hover {background:#0052cc;}
    </style>
</head>
<body>
    <div class="header">
        <h1>Promo Scene Assistant – Admin Dashboard</h1>
    </div>
    <div class="container">
        <div class="card">
            <h2>Welcome, Admin!</h2>
            <p>This dashboard will eventually list campaigns, assets, and provide manual billing forms.</p>
            <button class="btn" onclick="alert('Feature coming soon')">Create New Campaign</button>
        </div>
        <!-- Placeholder for future campaign list -->
        <div class="card" id="campaign-list">
            <h3>Campaigns</h3>
            <p>Loading...</p>
        </div>
    </div>
    <script>
        // Example vanilla JS to fetch campaigns via API
        async function loadCampaigns() {
            try {
                const resp = await fetch('/api/campaigns');
                const data = await resp.json();
                const listEl = document.getElementById('campaign-list');
                if (data.length === 0) {
                    listEl.innerHTML = '<p>No campaigns yet.</p>';
                    return;
                }
                const ul = document.createElement('ul');
                data.forEach(c => {
                    const li = document.createElement('li');
                    li.textContent = `#${c.id}: ${c.productName || 'Untitled'} – ${c.status}`;
                    ul.appendChild(li);
                });
                listEl.innerHTML = '';
                listEl.appendChild(ul);
            } catch (e) {
                console.error(e);
                document.getElementById('campaign-list').innerHTML = '<p>Error loading campaigns.</p>';
            }
        }
        loadCampaigns();
    </script>
</body>
</html>
