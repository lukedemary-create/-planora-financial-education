/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import { lazy } from 'react';

const AIAdvisor = lazy(() => import('./pages/AIAdvisor'));
const BudgetPlanner = lazy(() => import('./pages/BudgetPlanner'));
const Calculators = lazy(() => import('./pages/Calculators'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FedRates = lazy(() => import('./pages/FedRates'));
const FuturePlanning = lazy(() => import('./pages/FuturePlanning'));
const MarketHistory = lazy(() => import('./pages/MarketHistory'));
const PoliticsEconomy = lazy(() => import('./pages/PoliticsEconomy'));
const PortfolioTracker = lazy(() => import('./pages/PortfolioTracker'));
const RiskAnalysis = lazy(() => import('./pages/RiskAnalysis'));
const SixPillars = lazy(() => import('./pages/SixPillars'));
const StockLookup = lazy(() => import('./pages/StockLookup'));
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAdvisor": AIAdvisor,
    "BudgetPlanner": BudgetPlanner,
    "Calculators": Calculators,
    "Dashboard": Dashboard,
    "FedRates": FedRates,
    "FuturePlanning": FuturePlanning,
    "MarketHistory": MarketHistory,
    "PoliticsEconomy": PoliticsEconomy,
    "PortfolioTracker": PortfolioTracker,
    "RiskAnalysis": RiskAnalysis,
    "SixPillars": SixPillars,
    "StockLookup": StockLookup,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};