// Global state
let currentWorkspace = 'projet-web';
let editingCardId = null;
let dashboardVisible = false;

// Sample data with column history for metrics calculation
const appData = {
    workspaces: {
        'projet-web': { 
            name: '🌐 Projet Web',
            swimlanes: [
                { id: 'frontend', name: 'Frontend', emoji: '🎨' },
                { id: 'backend', name: 'Backend', emoji: '⚙️' }
            ],
            columns: [
                { id: 'todo', name: 'À faire', emoji: '📋' },
                { id: 'inprogress', name: 'En cours', emoji: '⚡' },
                { id: 'review', name: 'En révision', emoji: '👀' },
                { id: 'done', name: 'Terminé', emoji: '✅' }
            ]
        },
        'marketing': { 
            name: '📈 Marketing',
            swimlanes: [{ id: 'campaigns', name: 'Campagnes', emoji: '📢' }],
            columns: [
                { id: 'planning', name: 'Planning', emoji: '📅' },
                { id: 'creation', name: 'Création', emoji: '🎨' },
                { id: 'review', name: 'Révision', emoji: '👀' },
                { id: 'published', name: 'Publié', emoji: '🚀' }
            ]
        }
    },
    cards: {
        'projet-web': {
            'frontend': {
                'todo': [
                    {
                        id: 1,
                        title: 'Refonte du design système',
                        description: 'Mise à jour complète du design système',
                        author: 'Marie Dupont',
                        priority: 'high',
                        estimation: 16,
                        actualTime: null,
                        created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        columnHistory: [
                            { column: 'todo', swimlane: 'frontend', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
                        ]
                    }
                ],
                'inprogress': [
                    {
                        id: 2,
                        title: 'Optimisation des performances',
                        description: 'Amélioration des temps de chargement',
                        author: 'Jean Martin',
                        priority: 'medium',
                        estimation: 12,
                        actualTime: 8,
                        created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        columnHistory: [
                            { column: 'todo', swimlane: 'frontend', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
                            { column: 'inprogress', swimlane: 'frontend', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
                        ]
                    }
                ],
                'review': [],
                'done': [
                    {
                        id: 7,
                        title: 'Responsive design mobile',
                        description: 'Adaptation mobile et tablette',
                        author: 'Sophie Bernard',
                        priority: 'medium',
                        estimation: 20,
                        actualTime: 18,
                        created: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                        columnHistory: [
                            { column: 'todo', swimlane: 'frontend', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
                            { column: 'inprogress', swimlane: 'frontend', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
                            { column: 'review', swimlane: 'frontend', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
                            { column: 'done', swimlane: 'frontend', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
                        ]
                    }
                ]
            },
            'backend': {
                'todo': [
                    {
                        id: 3,
                        title: 'API de gestion des utilisateurs',
                        description: 'Développement API REST',
                        author: 'Sophie Bernard',
                        priority: 'high',
                        estimation: 24,
                        actualTime: null,
                        created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        columnHistory: [
                            { column: 'todo', swimlane: 'backend', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
                        ]
                    }
                ],
                'inprogress': [],
                'review': [],
                'done': []
            }
        },
        'marketing': {
            'campaigns': {
                'planning': [
                    {
                        id: 4,
                        title: 'Campagne été 2025',
                        description: 'Planification campagne marketing',
                        author: 'Pierre Dubois',
                        priority: 'medium',
                        estimation: 40,
                        created: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                        columnHistory: [
                            { column: 'planning', swimlane: 'campaigns', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
                        ]
                    }
                ],
                'creation': [],
                'review': [],
                'published': []
            }
        }
    },
    activities: {
        'projet-web': [],
        'marketing': []
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    renderSwimlanes();
    renderActivities();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('cardForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (editingCardId) {
            updateCard();
        } else {
            createCard();
        }
    });

    // Modal close on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === 'block') {
                    closeModal(modal.id);
                }
            });
        }
        
        // Dashboard shortcut Ctrl+D
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            if (dashboardVisible) {
                closeDashboard();
            } else {
                openDashboard();
            }
        }
    });
}

// Workspace functions
function switchWorkspace() {
    const select = document.getElementById('workspaceSelect');
    currentWorkspace = select.value;
    
    if (dashboardVisible) {
        renderDashboard();
    } else {
        renderSwimlanes();
    }
    renderActivities();
    logActivity('workspace', 'Workspace changé: ' + appData.workspaces[currentWorkspace].name);
}

function createWorkspace() {
    const name = prompt('Nom du nouveau workspace:');
    if (name && name.trim()) {
        const id = name.toLowerCase().replace(/\s+/g, '-');
        appData.workspaces[id] = {
            name: '🏢 ' + name,
            swimlanes: [{ id: 'general', name: 'Général', emoji: '📋' }],
            columns: [
                { id: 'todo', name: 'À faire', emoji: '📋' },
                { id: 'inprogress', name: 'En cours', emoji: '⚡' },
                { id: 'review', name: 'En révision', emoji: '👀' },
                { id: 'done', name: 'Terminé', emoji: '✅' }
            ]
        };
        
        appData.cards[id] = { 'general': { 'todo': [], 'inprogress': [], 'review': [], 'done': [] } };
        appData.activities[id] = [];
        
        updateWorkspaceSelect();
        logActivity('system', 'Workspace créé: ' + name);
    }
}

function updateWorkspaceSelect() {
    const select = document.getElementById('workspaceSelect');
    select.innerHTML = Object.keys(appData.workspaces).map(id => 
        '<option value="' + id + '"' + (id === currentWorkspace ? ' selected' : '') + '>' + appData.workspaces[id].name + '</option>'
    ).join('');
}

// Render functions
function renderSwimlanes() {
    const container = document.getElementById('swimlaneContainer');
    const workspace = appData.workspaces[currentWorkspace];
    
    if (!workspace) return;

    container.innerHTML = workspace.swimlanes.map(swimlane => 
        '<div class="swimlane">' +
            '<div class="swimlane-header">' +
                '<div class="swimlane-title">' + swimlane.emoji + ' ' + swimlane.name + '</div>' +
                '<div>' +
                    '<button class="btn-small" onclick="editSwimlane(\'' + swimlane.id + '\')">Éditer</button>' +
                    '<button class="btn-small" onclick="deleteSwimlane(\'' + swimlane.id + '\')">Supprimer</button>' +
                '</div>' +
            '</div>' +
            '<div class="board">' +
                workspace.columns.map(column => createColumnHTML(column, swimlane.id)).join('') +
            '</div>' +
        '</div>'
    ).join('');
}

function createColumnHTML(column, swimlaneId) {
    const cards = getCards(swimlaneId, column.id);
    const cardsHTML = cards.map(card => createCardHTML(card)).join('');
    
    return '<div class="column" data-column="' + column.id + '" data-swimlane="' + swimlaneId + '">' +
        '<div class="column-header">' +
            '<div class="column-title">' +
                column.emoji + ' ' + column.name +
                '<span class="card-count">' + cards.length + '</span>' +
            '</div>' +
            '<button class="add-card-btn" onclick="openCardModal(\'' + column.id + '\', \'' + swimlaneId + '\')">' +
                '➕ Ajouter' +
            '</button>' +
        '</div>' +
        '<div class="cards-container" ondrop="handleDrop(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)">' +
            cardsHTML +
            (cards.length === 0 ? '<div class="drop-zone">Glissez vos cartes ici</div>' : '') +
        '</div>' +
    '</div>';
}

function createCardHTML(card) {
    const durationHTML = card.estimation || card.actualTime ? 
        '<div class="card-duration">' +
            (card.estimation ? '📅 Est: ' + card.estimation + 'h' : '') +
            (card.actualTime ? ' | ⏱️ Réel: ' + card.actualTime + 'h' : '') +
        '</div>' : '';

    return '<div class="card card-priority-' + card.priority + '" draggable="true" data-card-id="' + card.id + '" ' +
             'ondragstart="handleDragStart(event)" ondragend="handleDragEnd(event)">' +
            '<div class="card-actions">' +
                '<button class="card-action-btn" onclick="editCard(' + card.id + ')">✏️</button>' +
                '<button class="card-action-btn" onclick="deleteCard(' + card.id + ')">🗑️</button>' +
            '</div>' +
            '<div class="card-title" onclick="editCard(' + card.id + ')">' + card.title + '</div>' +
            '<div class="card-description">' + card.description + '</div>' +
            durationHTML +
            '<div class="card-meta">' +
                '<span class="card-author">' + (card.author || 'Non assigné') + '</span>' +
            '</div>' +
        '</div>';
}

// Card management
function openCardModal(columnId, swimlaneId) {
    editingCardId = null;
    
    document.getElementById('cardModalTitle').textContent = '📝 Nouvelle tâche';
    document.getElementById('cardSubmitBtn').textContent = 'Créer la tâche';
    
    document.querySelector('#cardModal').dataset.column = columnId;
    document.querySelector('#cardModal').dataset.swimlane = swimlaneId;
    
    document.getElementById('cardForm').reset();
    document.getElementById('cardModal').style.display = 'block';
    document.getElementById('cardTitle').focus();
}

function editCard(cardId) {
    const card = findCardById(cardId);
    if (!card) return;

    editingCardId = cardId;
    
    document.getElementById('cardModalTitle').textContent = '✏️ Éditer la tâche';
    document.getElementById('cardSubmitBtn').textContent = 'Mettre à jour';

    document.getElementById('cardTitle').value = card.title;
    document.getElementById('cardDescription').value = card.description || '';
    document.getElementById('cardAuthor').value = card.author || '';
    document.getElementById('cardPriority').value = card.priority || 'medium';
    document.getElementById('cardEstimation').value = card.estimation || '';
    document.getElementById('cardActualTime').value = card.actualTime || '';

    document.getElementById('cardModal').style.display = 'block';
}

function createCard() {
    const title = document.getElementById('cardTitle').value.trim();
    if (!title) return;

    const newCard = {
        id: Date.now(),
        title: title,
        description: document.getElementById('cardDescription').value.trim(),
        author: document.getElementById('cardAuthor').value,
        priority: document.getElementById('cardPriority').value,
        estimation: parseFloat(document.getElementById('cardEstimation').value) || null,
        actualTime: parseFloat(document.getElementById('cardActualTime').value) || null,
        created: new Date().toISOString(),
        columnHistory: []
    };

    const swimlaneId = document.querySelector('#cardModal').dataset.swimlane;
    const columnId = document.querySelector('#cardModal').dataset.column;
    
    newCard.columnHistory.push({
        column: columnId,
        swimlane: swimlaneId,
        timestamp: newCard.created
    });
    
    ensureCardStructure(swimlaneId, columnId);
    appData.cards[currentWorkspace][swimlaneId][columnId].push(newCard);
    
    logActivity('create', 'Carte créée: "' + title + '"');
    renderSwimlanes();
    closeModal('cardModal');
}

function updateCard() {
    const card = findCardById(editingCardId);
    if (!card) return;

    const title = document.getElementById('cardTitle').value.trim();
    if (!title) return;

    card.title = title;
    card.description = document.getElementById('cardDescription').value.trim();
    card.author = document.getElementById('cardAuthor').value;
    card.priority = document.getElementById('cardPriority').value;
    card.estimation = parseFloat(document.getElementById('cardEstimation').value) || null;
    card.actualTime = parseFloat(document.getElementById('cardActualTime').value) || null;

    logActivity('update', 'Carte modifiée: "' + title + '"');
    renderSwimlanes();
    closeModal('cardModal');
}

function deleteCard(cardId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) return;

    let cardTitle = '';
    Object.keys(appData.cards[currentWorkspace] || {}).forEach(swimlaneId => {
        Object.keys(appData.cards[currentWorkspace][swimlaneId] || {}).forEach(columnId => {
            const cardIndex = appData.cards[currentWorkspace][swimlaneId][columnId].findIndex(card => card.id === cardId);
            if (cardIndex !== -1) {
                cardTitle = appData.cards[currentWorkspace][swimlaneId][columnId][cardIndex].title;
                appData.cards[currentWorkspace][swimlaneId][columnId].splice(cardIndex, 1);
            }
        });
    });

    if (cardTitle) {
        logActivity('delete', 'Carte supprimée: "' + cardTitle + '"');
        renderSwimlanes();
    }
}

// Drag and drop functions
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.cardId);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    const dropZone = e.currentTarget.querySelector('.drop-zone');
    if (dropZone) dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
        const dropZone = e.currentTarget.querySelector('.drop-zone');
        if (dropZone) dropZone.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const cardId = parseInt(e.dataTransfer.getData('text/plain'));
    const targetColumn = e.currentTarget.closest('.column');
    const targetColumnId = targetColumn.dataset.column;
    const targetSwimlaneId = targetColumn.dataset.swimlane;
    
    const dropZone = e.currentTarget.querySelector('.drop-zone');
    if (dropZone) dropZone.classList.remove('drag-over');

    moveCard(cardId, targetSwimlaneId, targetColumnId);
}

function moveCard(cardId, targetSwimlaneId, targetColumnId) {
    let cardToMove = null;
    let sourceInfo = null;

    Object.keys(appData.cards[currentWorkspace] || {}).forEach(swimlaneId => {
        Object.keys(appData.cards[currentWorkspace][swimlaneId] || {}).forEach(columnId => {
            const cardIndex = appData.cards[currentWorkspace][swimlaneId][columnId].findIndex(card => card.id === cardId);
            if (cardIndex !== -1) {
                cardToMove = appData.cards[currentWorkspace][swimlaneId][columnId][cardIndex];
                appData.cards[currentWorkspace][swimlaneId][columnId].splice(cardIndex, 1);
                sourceInfo = { swimlaneId, columnId };
            }
        });
    });

    if (cardToMove && sourceInfo) {
        ensureCardStructure(targetSwimlaneId, targetColumnId);
        appData.cards[currentWorkspace][targetSwimlaneId][targetColumnId].push(cardToMove);
        
        // Add movement to history for metrics calculation
        if (!cardToMove.columnHistory) cardToMove.columnHistory = [];
        cardToMove.columnHistory.push({
            column: targetColumnId,
            swimlane: targetSwimlaneId,
            timestamp: new Date().toISOString()
        });
        
        logActivity('move', '"' + cardToMove.title + '" déplacée');
        renderSwimlanes();
    }
}

// Dashboard functions
function openDashboard() {
    dashboardVisible = true;
    document.getElementById('boardContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';
    document.getElementById('activityPanel').style.display = 'none';
    
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    document.getElementById('dashboardEndDate').value = endDate.toISOString().split('T')[0];
    document.getElementById('dashboardStartDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('dashboardWorkspace').textContent = appData.workspaces[currentWorkspace].name;
    
    renderDashboard();
}

function closeDashboard() {
    dashboardVisible = false;
    document.getElementById('boardContainer').style.display = 'flex';
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('activityPanel').style.display = 'flex';
}

function refreshDashboard() {
    renderDashboard();
    logActivity('system', 'Dashboard actualisé');
}

function renderDashboard() {
    const container = document.getElementById('dashboardGrid');
    const startDate = new Date(document.getElementById('dashboardStartDate').value);
    const endDate = new Date(document.getElementById('dashboardEndDate').value);
    
    const metrics = calculateMetrics(startDate, endDate);
    
    container.innerHTML = 
        createThroughputCard(metrics) +
        createWIPCard(metrics) +
        createCycleTimeCard(metrics) +
        createLeadTimeCard(metrics) +
        createCumulativeFlowCard(metrics) +
        createAgeItemsCard(metrics);
}

// Metrics calculation functions
function calculateMetrics(startDate, endDate) {
    const workspaceCards = appData.cards[currentWorkspace] || {};
    const allCards = [];
    
    // Collect all cards from workspace
    Object.keys(workspaceCards).forEach(swimlaneId => {
        Object.keys(workspaceCards[swimlaneId]).forEach(columnId => {
            workspaceCards[swimlaneId][columnId].forEach(card => {
                const cardCopy = Object.assign({}, card);
                cardCopy.currentColumn = columnId;
                cardCopy.currentSwimlane = swimlaneId;
                allCards.push(cardCopy);
            });
        });
    });
    
    return {
        throughput: calculateThroughput(allCards, startDate, endDate),
        wip: calculateWIP(allCards),
        cycleTime: calculateCycleTime(allCards),
        leadTime: calculateLeadTime(allCards),
        cumulativeFlow: { data: [], columns: [] }, // Placeholder
        ageItems: calculateAgeItems(allCards)
    };
}

function calculateThroughput(cards, startDate, endDate) {
    const doneCards = cards.filter(card => 
        card.currentColumn === 'done' || card.currentColumn === 'published'
    );
    
    const days = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    
    // Generate sample weekly data for chart
    const weeklyData = [3, 2, 5, 4, 6, 3, 7].map((count, i) => ({ week: 'S' + (i+1), count: count }));
    
    return {
        total: doneCards.length,
        perDay: Math.round((doneCards.length / days) * 10) / 10,
        trend: weeklyData,
        change: 15 // Sample percentage change
    };
}

function calculateWIP(cards) {
    const wipCards = cards.filter(card => 
        card.currentColumn === 'inprogress' || card.currentColumn === 'review' || card.currentColumn === 'creation'
    );
    
    return {
        total: wipCards.length,
        byColumn: { 
            'En cours': wipCards.filter(c => c.currentColumn === 'inprogress').length,
            'En révision': wipCards.filter(c => c.currentColumn === 'review').length
        },
        violations: [],
        efficiency: 85
    };
}

function calculateCycleTime(cards) {
    const completedCards = cards.filter(card => 
        card.columnHistory && (card.currentColumn === 'done' || card.currentColumn === 'published')
    );
    
    const cycleTimes = [];
    
    completedCards.forEach(card => {
        const startWork = card.columnHistory && card.columnHistory.find(h => h.column === 'inprogress' || h.column === 'creation');
        const completed = card.columnHistory && card.columnHistory.find(h => h.column === 'done' || h.column === 'published');
        
        if (startWork && completed) {
            const cycleTime = (new Date(completed.timestamp) - new Date(startWork.timestamp)) / (1000 * 60 * 60 * 24);
            cycleTimes.push(Math.max(0, cycleTime));
        }
    });
    
    const average = cycleTimes.length > 0 ? cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length : 4.2;
    
    return {
        average: Math.round(average * 10) / 10,
        median: 3.5,
        p85: 7.1,
        breakdown: { 'En cours': 2.1, 'Révision': 1.8 }
    };
}

function calculateLeadTime(cards) {
    const completedCards = cards.filter(card => 
        card.columnHistory && (card.currentColumn === 'done' || card.currentColumn === 'published')
    );
    
    const leadTimes = [];
    
    completedCards.forEach(card => {
        const completed = card.columnHistory && card.columnHistory.find(h => h.column === 'done' || h.column === 'published');
        if (completed) {
            const leadTime = (new Date(completed.timestamp) - new Date(card.created)) / (1000 * 60 * 60 * 24);
            leadTimes.push(Math.max(0, leadTime));
        }
    });
    
    const average = leadTimes.length > 0 ? leadTimes.reduce((sum, time) => sum + time, 0) / leadTimes.length : 8.5;
    
    return {
        average: Math.round(average * 10) / 10,
        median: 7.2,
        p85: 12.4
    };
}

function calculateAgeItems(cards) {
    const wipCards = cards.filter(card => 
        card.currentColumn !== 'done' && card.currentColumn !== 'published'
    );
    
    const currentDate = new Date();
    const ageData = wipCards.map(card => {
        const startDate = card.columnHistory && card.columnHistory.find(h => h.column === 'inprogress' || h.column === 'creation');
        const ageStartDate = startDate ? new Date(startDate.timestamp) : new Date(card.created);
        const age = (currentDate - ageStartDate) / (1000 * 60 * 60 * 24);
        
        return {
            id: card.id,
            title: card.title,
            age: Math.floor(age),
            priority: card.priority
        };
    });
    
    return {
        items: ageData.sort((a, b) => b.age - a.age),
        oldestAge: ageData.length > 0 ? Math.max.apply(Math, ageData.map(i => i.age)) : 0,
        averageAge: ageData.length > 0 ? ageData.reduce((sum, i) => sum + i.age, 0) / ageData.length : 0
    };
}

// Metric card creation functions
function createThroughputCard(metrics) {
    const throughput = metrics.throughput;
    const chartBars = throughput.trend.map(week => {
        const maxCount = Math.max.apply(Math, throughput.trend.map(w => w.count));
        const height = maxCount > 0 ? (week.count / maxCount) * 100 : 0;
        return '<div class="bar" style="height: ' + height + '%">' +
                    '<div class="bar-label">' + week.week + '</div>' +
                '</div>';
    }).join('');
    
    return '<div class="metric-card">' +
            '<div class="metric-header">' +
                '<div class="metric-title">🚀 Débit (Throughput)</div>' +
            '</div>' +
            '<div class="metric-value">' + throughput.total + '</div>' +
            '<div class="metric-subtitle">tâches terminées (' + throughput.perDay + '/jour)</div>' +
            '<div class="metric-trend trend-up">📈 +' + throughput.change + '% vs semaine précédente</div>' +
            '<div class="metric-chart">' +
                '<div class="bar-chart">' + chartBars + '</div>' +
            '</div>' +
        '</div>';
}

function createWIPCard(metrics) {
    const wip = metrics.wip;
    const columnDetails = Object.entries(wip.byColumn).map(entry => 
        '<div style="display: flex; justify-content: space-between; margin: 4px 0;">' +
            '<span>' + entry[0] + ':</span><span><strong>' + entry[1] + '</strong></span>' +
        '</div>'
    ).join('');
    
    return '<div class="metric-card">' +
            '<div class="metric-header">' +
                '<div class="metric-title">⚡ Travail en cours (WIP)</div>' +
            '</div>' +
            '<div class="metric-value">' + wip.total + '</div>' +
            '<div class="metric-subtitle">tâches en cours</div>' +
            '<div class="metric-trend trend-up">📊 Efficacité: ' + wip.efficiency + '%</div>' +
            '<div style="margin-top: 16px; font-size: 12px;">' + columnDetails + '</div>' +
        '</div>';
}
