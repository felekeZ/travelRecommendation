// Global variable to store fetched data
let travelData = null;

// Fetch data from JSON file when page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    
    // Attach event listeners
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) searchBtn.addEventListener('click', searchRecommendations);
    if (clearBtn) clearBtn.addEventListener('click', clearResults);
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchRecommendations();
        });
    }
});

// Function to fetch data from JSON
async function fetchData() {
    try {
        const response = await fetch('travel_recommendation_api.json');
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        travelData = await response.json();
        console.log('Data loaded successfully:', travelData);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Main search function
function searchRecommendations() {
    const searchInput = document.getElementById('searchInput');
    let keyword = searchInput.value.trim().toLowerCase();
    
    if (!keyword) {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'none';
        return;
    }
    
    if (!travelData) {
        alert('Data is still loading. Please try again in a moment.');
        return;
    }
    
    let results = [];
    
    // Check for beach keywords (beach, beaches)
    if (keyword === 'beach' || keyword === 'beaches') {
        results = travelData.beaches || [];
    }
    // Check for temple keywords (temple, temples)
    else if (keyword === 'temple' || keyword === 'temples') {
        results = travelData.temples || [];
    }
    // Check for country keywords (country, countries)
    else if (keyword === 'country' || keyword === 'countries') {
        // Show all cities from all countries
        if (travelData.countries) {
            travelData.countries.forEach(country => {
                if (country.cities) {
                    results.push(...country.cities);
                }
            });
        }
    }
    else {
        // Search in countries for specific country name
        if (travelData.countries) {
            const foundCountry = travelData.countries.find(c => 
                c.name.toLowerCase() === keyword
            );
            if (foundCountry && foundCountry.cities) {
                results = foundCountry.cities;
            }
        }
        
        // Also search in beaches and temples if no country match
        if (results.length === 0) {
            // Search in beaches
            if (travelData.beaches) {
                const beachMatches = travelData.beaches.filter(beach => 
                    beach.name.toLowerCase().includes(keyword)
                );
                results.push(...beachMatches);
            }
            
            // Search in temples
            if (travelData.temples) {
                const templeMatches = travelData.temples.filter(temple => 
                    temple.name.toLowerCase().includes(keyword)
                );
                results.push(...templeMatches);
            }
            
            // Search in all cities
            if (travelData.countries) {
                travelData.countries.forEach(country => {
                    if (country.cities) {
                        const cityMatches = country.cities.filter(city => 
                            city.name.toLowerCase().includes(keyword)
                        );
                        results.push(...cityMatches);
                    }
                });
            }
        }
    }
    
    displayResults(results);
}

// Function to display results
function displayResults(results) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsGrid = document.getElementById('resultsGrid');
    
    if (!resultsSection || !resultsGrid) return;
    
    if (results.length === 0) {
        resultsGrid.innerHTML = '<div class="no-results">😔 No recommendations found. Try "beach", "temple", "country", or a specific country name like "Japan" or "Australia".</div>';
        resultsSection.style.display = 'block';
        return;
    }
    
    resultsGrid.innerHTML = results.map(item => `
        <div class="result-card">
            <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Destination+Image'">
            <div class="card-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
            </div>
        </div>
    `).join('');
    
    resultsSection.style.display = 'block';
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Function to clear results
function clearResults() {
    const searchInput = document.getElementById('searchInput');
    const resultsSection = document.getElementById('resultsSection');
    const resultsGrid = document.getElementById('resultsGrid');
    
    if (searchInput) searchInput.value = '';
    if (resultsSection) resultsSection.style.display = 'none';
    if (resultsGrid) resultsGrid.innerHTML = '';
}