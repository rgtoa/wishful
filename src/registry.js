// registry.js — maps route names (used by nav.push / nav.go / openSheet) to components.
import { Home, ListView, ItemDetail } from './home.jsx';
import { AddItem, NewList, EditList, PartnerList, Share, Profile, Onboarding, ItemMenu, ListMenu, MoveItem } from './flows.jsx';
import { PatternLock, SecretList, Personalize, Splash, Celebrate, RecentlyDeleted, Notifications, GiftPlans, Genie } from './extras.jsx';

export const SCREENS = {
  Home, ListView, ItemDetail,
  AddItem, NewList, EditList, PartnerList, Share, Profile, Onboarding, ItemMenu, ListMenu, MoveItem,
  PatternLock, SecretList, Personalize, Splash, Celebrate, RecentlyDeleted, Notifications, GiftPlans, Genie,
};
