import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Clock, Activity, DollarSign, Plus, Trash2, RefreshCw, Zap, Filter, AlertTriangle } from 'lucide-react';

const NBAOddsApp = () => {
  const [games, setGames] = useState([]);
  const [injuries, setInjuries] = useState({});
  const [parlay, setParlay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [parlayStake, setParlayStake] = useState(100);
  const [filter, setFilter] = useState('all'); // 'all', 'live', 'upcoming'
  const cacheRef = useRef({ data: null, timestamp: null });
  
  const CACHE_DURATION = 30000; // 30 seconds
  const REFRESH_INTERVAL = 45000; // 45 seconds

  // Enhanced injury data with more realistic information
  const getInjuriesForTeam = useCallback((teamName) => {
    const injuryDatabase = {
      'Lakers': [
        { player: 'Anthony Davis', status: 'Questionable', injury: 'Ankle Sprain', impact: 'High' },
        { player: 'Rui Hachimura', status: 'Out', injury: 'Calf Strain', impact: 'Medium' }
      ],
      'Los Angeles Lakers': [
        { player: 'Anthony Davis', status: 'Questionable', injury: 'Ankle Sprain', impact: 'High' },
        { player: 'Rui Hachimura', status: 'Out', injury: 'Calf Strain', impact: 'Medium' }
      ],
      'Warriors': [
        { player: 'Draymond Green', status: 'Probable', injury: 'Back Soreness', impact: 'Medium' }
      ],
      'Golden State Warriors': [
        { player: 'Draymond Green', status: 'Probable', injury: 'Back Soreness', impact: 'Medium' }
      ],
      'Celtics': [
        { player: 'Kristaps Porzingis', status: 'Out', injury: 'Knee Injury', impact: 'High' }
      ],
      'Boston Celtics': [
        { player: 'Kristaps Porzingis', status: 'Out', injury: 'Knee Injury', impact: 'High' }
      ],
      'Nuggets': [
        { player: 'Jamal Murray', status: 'Questionable', injury: 'Hamstring', impact: 'High' }
      ],
      'Denver Nuggets': [
        { player: 'Jamal Murray', status: 'Questionable', injury: 'Hamstring', impact: 'High' }
      ],
      'Heat': [
        { player: 'Tyler Herro', status: 'Questionable', injury: 'Ankle', impact: 'Medium' }
      ],
      'Miami Heat': [
        { player: 'Tyler Herro', status: 'Questionable', injury: 'Ankle', impact: 'Medium' }
      ]
    };
    
    return injuryDatabase[teamName] || [];
  }, []);

  // Enhanced odds generation with more realistic calculations
  const generateOdds = useCallback((game) => {
    const homeComp = game.competitions[0].competitors.find(c => c.homeAway === 'home');
    const awayComp = game.competitions[0].competitors.find(c => c.homeAway === 'away');
    
    const homeScore = parseInt(homeComp.score) || 0;
    const awayScore = parseInt(awayComp.score) || 0;
    const homeTeam = homeComp.team.displayName;
    const awayTeam = awayComp.team.displayName;
    
    const scoreDiff = homeScore - awayScore;
    const isLive = game.status.type.state === 'in';
    const isPregame = game.status.type.state === 'pre';
    
    // Base odds calculation
    let homeOdds = -110;
    let awayOdds = -110;
    
    if (isLive) {
      // Dynamic odds based on live game state
      const period = game.status.period;
      const minutesRemaining = parseFloat(game.status.displayClock) || 0;
      const gameProgress = (period * 12 - minutesRemaining) / 48; // Percentage of game completed
      
      // Larger score differentials have exponentially increasing odds
      if (scoreDiff > 0) {
        const magnitude = Math.min(scoreDiff * (1 + gameProgress), 40);
        homeOdds = -110 - (magnitude * 15);
        awayOdds = 100 + (magnitude * 20);
      } else if (scoreDiff < 0) {
        const magnitude = Math.min(Math.abs(scoreDiff) * (1 + gameProgress), 40);
        awayOdds = -110 - (magnitude * 15);
        homeOdds = 100 + (magnitude * 20);
      } else {
        // Close game
        homeOdds = -105 + (Math.random() * 10 - 5);
        awayOdds = -105 + (Math.random() * 10 - 5);
      }
    } else if (isPregame) {
      // Pre-game odds with team strength variance
      const homeAdvantage = 3; // Home court advantage
      const variance = Math.random() * 30 - 15;
      homeOdds = -110 - homeAdvantage + variance;
      awayOdds = -110 + homeAdvantage - variance;
    }

    // Apply injury impact
    const homeInjuries = getInjuriesForTeam(homeTeam);
    const awayInjuries = getInjuriesForTeam(awayTeam);
    
    homeInjuries.forEach(inj => {
      const impactMultiplier = inj.impact === 'High' ? 2 : 1;
      if (inj.status === 'Out') homeOdds += 20 * impactMultiplier;
      if (inj.status === 'Questionable') homeOdds += 8 * impactMultiplier;
    });
    
    awayInjuries.forEach(inj => {
      const impactMultiplier = inj.impact === 'High' ? 2 : 1;
      if (inj.status === 'Out') awayOdds += 20 * impactMultiplier;
      if (inj.status === 'Questionable') awayOdds += 8 * impactMultiplier;
    });

    // Calculate spread and total
    const spread = isPregame ? (Math.random() * 12 - 6) : (scoreDiff * 0.6);
    const baseTotal = 220 + (Math.random() * 20 - 10);
    const overUnder = baseTotal;

    return {
      home: Math.round(homeOdds),
      away: Math.round(awayOdds),
      overUnder: parseFloat(overUnder.toFixed(1)),
      spread: parseFloat(spread.toFixed(1)),
      timestamp: Date.now()
    };
  }, [getInjuriesForTeam]);

  // Fetch NBA games from ESPN API with improved error handling
  const fetchGames = useCallback(async (useCache = true) => {
    // Check cache first
    const cache = cacheRef.current;
    if (useCache && cache.data && cache.timestamp && 
        (Date.now() - cache.timestamp < CACHE_DURATION)) {
      console.log('Using cached data');
      setGames(cache.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.events || data.events.length === 0) {
        setGames([]);
        setError({ type: 'no_games', message: 'No games scheduled for today' });
        setLoading(false);
        return;
      }
      
      // Process games and add odds
      const gamesWithOdds = data.events.map(game => ({
        ...game,
        odds: generateOdds(game)
      }));

      setGames(gamesWithOdds);
      cacheRef.current = { data: gamesWithOdds, timestamp: Date.now() };
      setLastUpdate(new Date());
      
      // Collect all injuries from games
      const allInjuries = {};
      gamesWithOdds.forEach(game => {
        const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home').team.displayName;
        const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away').team.displayName;
        
        const homeInj = getInjuriesForTeam(homeTeam);
        const awayInj = getInjuriesForTeam(awayTeam);
        
        if (homeInj.length > 0) allInjuries[homeTeam] = homeInj;
        if (awayInj.length > 0) allInjuries[awayTeam] = awayInj;
      });
      
      setInjuries(allInjuries);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError({ 
        type: 'fetch_error', 
        message: 'Failed to load games. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  }, [generateOdds, getInjuriesForTeam]);

  // Auto-refresh with cleanup
  useEffect(() => {
    fetchGames(false);
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchGames(false);
      }, REFRESH_INTERVAL);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchGames]);

  // Parlay management with duplicate game check
  const addToParlay = (game, pick, odds) => {
    const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home').team;
    const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away').team;
    
    // Check if we already have a bet from this game
    const existingBetFromGame = parlay.find(p => p.gameId === game.id);
    
    if (existingBetFromGame) {
      // Replace the existing bet from this game
      setParlay(parlay.map(p => 
        p.gameId === game.id 
          ? {
              id: `${game.id}-${pick}`,
              gameId: game.id,
              pick,
              odds,
              homeTeam: homeTeam.displayName,
              awayTeam: awayTeam.displayName,
              matchup: `${awayTeam.displayName} @ ${homeTeam.displayName}`
            }
          : p
      ));
    } else {
      // Add new bet
      const bet = {
        id: `${game.id}-${pick}`,
        gameId: game.id,
        pick,
        odds,
        homeTeam: homeTeam.displayName,
        awayTeam: awayTeam.displayName,
        matchup: `${awayTeam.displayName} @ ${homeTeam.displayName}`
      };
      setParlay([...parlay, bet]);
    }
  };

  const removeFromParlay = (betId) => {
    setParlay(parlay.filter(p => p.id !== betId));
  };

  // Improved payout calculation
  const calculateParlayPayout = () => {
    if (parlay.length === 0) return 0;
    
    let totalDecimalOdds = 1;
    
    parlay.forEach(bet => {
      const odds = bet.odds;
      let decimalOdds;
      
      if (odds > 0) {
        // Positive American odds to decimal
        decimalOdds = (odds / 100) + 1;
      } else {
        // Negative American odds to decimal
        decimalOdds = (100 / Math.abs(odds)) + 1;
      }
      
      totalDecimalOdds *= decimalOdds;
    });
    
    const payout = parlayStake * totalDecimalOdds;
    const profit = payout - parlayStake;
    
    return {
      payout: payout.toFixed(2),
      profit: profit.toFixed(2)
    };
  };

  const formatOdds = (odds) => {
    return odds > 0 ? `+${odds}` : odds;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Out': return 'text-red-400';
      case 'Questionable': return 'text-yellow-400';
      case 'Probable': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Out': return 'bg-red-900/30 border-red-700/50';
      case 'Questionable': return 'bg-yellow-900/30 border-yellow-700/50';
      case 'Probable': return 'bg-green-900/30 border-green-700/50';
      default: return 'bg-gray-900/30 border-gray-700/50';
    }
  };

  const isLiveGame = (game) => {
    return game.status.type.state === 'in';
  };

  // Filter games
  const filteredGames = games.filter(game => {
    if (filter === 'live') return isLiveGame(game);
    if (filter === 'upcoming') return game.status.type.state === 'pre';
    return true;
  });

  // Loading state
  if (loading && games.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-emerald-400 font-bold text-xl">Loading Live Odds...</p>
        </div>
      </div>
    );
  }

  const payoutInfo = calculateParlayPayout();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Rajdhani', sans-serif;
          overflow-x: hidden;
        }
        
        .title-font {
          font-family: 'Bebas Neue', cursive;
          letter-spacing: 0.05em;
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
            border-color: rgba(16, 185, 129, 0.8);
          }
          50% { 
            box-shadow: 0 0 40px rgba(16, 185, 129, 0.8);
            border-color: rgba(16, 185, 129, 1);
          }
        }
        
        .live-indicator {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .game-card {
          animation: slide-up 0.5s ease-out;
        }
        
        .odds-button {
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        
        .odds-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .odds-button:hover::before {
          width: 300px;
          height: 300px;
        }
        
        .odds-button:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
        }
        
        .odds-button:active {
          transform: scale(0.98);
        }
        
        .odds-button.selected {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.9) 100%);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
        }
        
        .parlay-item {
          animation: slide-up 0.3s ease-out;
        }
        
        .noise-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
        }
        
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 1;
        }
        
        @media (max-width: 768px) {
          .title-font {
            font-size: 1.5rem;
          }
        }
      `}</style>

      {/* Header */}
      <div className="border-b border-emerald-900/30 bg-slate-950/95 backdrop-blur-lg sticky top-0 z-50 shadow-xl shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                <h1 className="text-3xl sm:text-4xl title-font text-emerald-400">LIVE ODDS</h1>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-950/50 px-2 sm:px-3 py-1 rounded-full border border-emerald-800/50">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold">REAL-TIME</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-6">
              {lastUpdate && (
                <div className="hidden md:flex items-center space-x-2 text-slate-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
                </div>
              )}
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  autoRefresh 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{autoRefresh ? 'AUTO' : 'MANUAL'}</span>
              </button>

              <button
                onClick={() => fetchGames(false)}
                disabled={loading}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">REFRESH</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-400 mb-1">
                {error.type === 'no_games' ? 'No Games Today' : 'Connection Error'}
              </h3>
              <p className="text-red-300 text-sm">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Games Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl title-font text-white">TODAY'S GAMES</h2>
              
              <div className="flex items-center space-x-3">
                <div className="text-slate-400 text-sm">
                  {filteredGames.length} {filteredGames.length === 1 ? 'Game' : 'Games'}
                </div>
                
                {/* Filter Buttons */}
                <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                      filter === 'all' 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ALL
                  </button>
                  <button
                    onClick={() => setFilter('live')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                      filter === 'live' 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    LIVE
                  </button>
                  <button
                    onClick={() => setFilter('upcoming')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                      filter === 'upcoming' 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    UPCOMING
                  </button>
                </div>
              </div>
            </div>

            {filteredGames.length === 0 ? (
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-12 text-center">
                <Filter className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No games match your filter</p>
                <button
                  onClick={() => setFilter('all')}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold transition-all"
                >
                  Show All Games
                </button>
              </div>
            ) : (
              filteredGames.map((game, index) => {
                const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home');
                const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away');
                const isLive = isLiveGame(game);
                const homeInjuries = injuries[homeTeam.team.displayName] || [];
                const awayInjuries = injuries[awayTeam.team.displayName] || [];
                const isAwaySelected = parlay.find(p => p.gameId === game.id && p.pick === awayTeam.team.displayName);
                const isHomeSelected = parlay.find(p => p.gameId === game.id && p.pick === homeTeam.team.displayName);
                
                return (
                  <div
                    key={game.id}
                    className="game-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden hover:border-emerald-700/50 transition-all backdrop-blur-sm"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Live Indicator */}
                    {isLive && (
                      <div className="live-indicator bg-emerald-500/20 border-l-4 border-emerald-500 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-emerald-400 font-bold text-sm">LIVE - {game.status.type.detail}</span>
                        </div>
                        <span className="text-emerald-400 font-bold text-sm">
                          Q{game.status.period} {game.status.displayClock}
                        </span>
                      </div>
                    )}
                    
                    {/* Pre-game time */}
                    {!isLive && game.status.type.state === 'pre' && (
                      <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between border-b border-slate-700/50">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300 font-semibold text-sm">
                            {new Date(game.date).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs">{game.competitions[0].venue.fullName}</span>
                      </div>
                    )}

                    <div className="p-4 sm:p-6">
                      {/* Teams and Scores */}
                      <div className="space-y-4 mb-6">
                        {/* Away Team */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <img 
                              src={awayTeam.team.logo} 
                              alt={awayTeam.team.displayName}
                              className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-lg sm:text-xl font-bold truncate">{awayTeam.team.displayName}</div>
                              {awayInjuries.length > 0 && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <AlertCircle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                                  <span className="text-xs text-yellow-500">{awayInjuries.length} injury update{awayInjuries.length > 1 ? 's' : ''}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-3xl sm:text-4xl title-font text-emerald-400 ml-4">{awayTeam.score}</div>
                        </div>

                        {/* Home Team */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <img 
                              src={homeTeam.team.logo} 
                              alt={homeTeam.team.displayName}
                              className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-lg sm:text-xl font-bold truncate">{homeTeam.team.displayName}</div>
                              {homeInjuries.length > 0 && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <AlertCircle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                                  <span className="text-xs text-yellow-500">{homeInjuries.length} injury update{homeInjuries.length > 1 ? 's' : ''}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-3xl sm:text-4xl title-font text-emerald-400 ml-4">{homeTeam.score}</div>
                        </div>
                      </div>

                      {/* Betting Options */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => addToParlay(game, awayTeam.team.displayName, game.odds.away)}
                          className={`odds-button p-3 sm:p-4 rounded-lg border-2 font-bold transition-all ${
                            isAwaySelected
                              ? 'selected border-emerald-500 text-white'
                              : 'bg-slate-800/50 border-slate-600 hover:border-emerald-600'
                          }`}
                        >
                          <div className="text-xs sm:text-sm text-slate-300 relative z-10">{awayTeam.team.abbreviation} ML</div>
                          <div className="text-xl sm:text-2xl title-font relative z-10">{formatOdds(game.odds.away)}</div>
                        </button>

                        <button
                          onClick={() => addToParlay(game, homeTeam.team.displayName, game.odds.home)}
                          className={`odds-button p-3 sm:p-4 rounded-lg border-2 font-bold transition-all ${
                            isHomeSelected
                              ? 'selected border-emerald-500 text-white'
                              : 'bg-slate-800/50 border-slate-600 hover:border-emerald-600'
                          }`}
                        >
                          <div className="text-xs sm:text-sm text-slate-300 relative z-10">{homeTeam.team.abbreviation} ML</div>
                          <div className="text-xl sm:text-2xl title-font relative z-10">{formatOdds(game.odds.home)}</div>
                        </button>
                      </div>

                      {/* Additional Betting Lines */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-slate-900/50 p-2 sm:p-3 rounded-lg border border-slate-700/50">
                          <div className="text-slate-400 text-xs sm:text-sm">Spread</div>
                          <div className="font-bold text-emerald-400">{game.odds.spread > 0 ? '+' : ''}{game.odds.spread.toFixed(1)}</div>
                        </div>
                        <div className="bg-slate-900/50 p-2 sm:p-3 rounded-lg border border-slate-700/50">
                          <div className="text-slate-400 text-xs sm:text-sm">O/U</div>
                          <div className="font-bold text-emerald-400">{game.odds.overUnder.toFixed(1)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar - Parlay Slip & Injuries */}
          <div className="space-y-6">
            {/* Parlay Builder */}
            <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900/50 rounded-2xl border-2 border-emerald-700/50 overflow-hidden backdrop-blur-sm sticky top-24">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                    <h3 className="text-lg sm:text-xl title-font">PARLAY SLIP</h3>
                  </div>
                  {parlay.length > 0 && (
                    <button
                      onClick={() => setParlay([])}
                      className="bg-red-600/80 hover:bg-red-600 px-3 py-1 rounded-lg text-sm font-bold transition-all"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4">
                {parlay.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Select bets to build your parlay</p>
                    <p className="text-xs mt-2 text-slate-500">Choose one team per game</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {parlay.map((bet, index) => (
                      <div
                        key={bet.id}
                        className="parlay-item bg-slate-800/50 p-3 rounded-lg border border-slate-700 hover:border-emerald-700/50 transition-all"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-slate-400 mb-1 truncate">{bet.matchup}</div>
                            <div className="font-bold text-emerald-400 truncate">{bet.pick}</div>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <span className="font-bold text-lg title-font whitespace-nowrap">{formatOdds(bet.odds)}</span>
                            <button
                              onClick={() => removeFromParlay(bet.id)}
                              className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Payout Calculator */}
                    <div className="mt-6 space-y-3">
                      <div className="bg-slate-900/70 p-4 rounded-lg border border-emerald-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-slate-300 font-semibold">Legs:</span>
                          <span className="font-bold text-emerald-400">{parlay.length}</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-slate-300 font-semibold">Stake:</span>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                            <input
                              type="number"
                              value={parlayStake}
                              onChange={(e) => setParlayStake(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-28 bg-slate-800 border border-slate-600 rounded pl-7 pr-2 py-2 text-right font-bold focus:border-emerald-500 focus:outline-none transition-colors"
                              min="1"
                              step="10"
                            />
                          </div>
                        </div>
                        <div className="pt-3 border-t border-slate-700 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">To Win:</span>
                            <span className="font-bold text-white">${payoutInfo.profit}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-emerald-400">Total Payout:</span>
                            <span className="text-2xl sm:text-3xl title-font text-emerald-400">${payoutInfo.payout}</span>
                          </div>
                        </div>
                      </div>

                      <button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 py-4 rounded-lg font-bold text-lg title-font transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/50">
                        PLACE BET
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Injury Report */}
            {Object.keys(injuries).length > 0 && (
              <div className="bg-gradient-to-br from-yellow-900/20 to-slate-900/50 rounded-2xl border border-yellow-700/30 overflow-hidden backdrop-blur-sm">
                <div className="bg-gradient-to-r from-yellow-600/80 to-yellow-700/80 p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    <h3 className="text-lg sm:text-xl title-font">INJURY REPORT</h3>
                  </div>
                </div>

                <div className="p-4 max-h-96 overflow-y-auto">
                  {Object.entries(injuries).map(([team, teamInjuries]) => (
                    <div key={team} className="mb-4 last:mb-0">
                      <h4 className="font-bold text-emerald-400 mb-2 text-sm">{team}</h4>
                      <div className="space-y-2">
                        {teamInjuries.map((injury, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border ${getStatusBgColor(injury.status)}`}
                          >
                            <div className="flex items-start justify-between mb-1 gap-2">
                              <span className="font-semibold text-sm">{injury.player}</span>
                              <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(injury.status)} bg-slate-900/50 whitespace-nowrap flex-shrink-0`}>
                                {injury.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-slate-400">{injury.injury}</div>
                            {injury.impact && (
                              <div className="text-xs text-slate-500 mt-1">
                                Impact: <span className={injury.impact === 'High' ? 'text-red-400' : 'text-yellow-400'}>{injury.impact}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Noise overlay for texture */}
      <div className="noise-overlay fixed inset-0 pointer-events-none"></div>
    </div>
  );
};

export default NBAOddsApp;
