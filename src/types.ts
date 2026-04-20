/**
 * User Roles
 */
export type UserRole = 'ADMIN' | 'STUDENT' | 'TEACHER';

/**
 * Typing Practice Types
 */
export type TypingType = 'POSITION' | 'WORD' | 'NORMAL';

/**
 * Verification Code Types
 */
export type VerificationType = 'REGISTER' | 'PASSWORD_RESET' | 'REWARD_CLAIM';

/**
 * Item Types
 */
export type ItemType = 'STICKER';

/**
 * Authentication User Payload
 */
export interface AuthUser {
  id: number;
  userId: string;
  role: UserRole;
}

/**
 * Typing Record Interface
 */
export interface TypingRecord {
  id: number;
  userId: string;
  cpm: number | null;
  accuracy: number | null;
  duration: number | null;
  type: TypingType;
  createdAt: string | Date;
}

/**
 * Common User Profile Interface
 */
export interface UserProfile {
  id: number;
  userId: string;
  email: string;
  nickname?: string | null;
  name?: string | null;
  role: UserRole;
  profileImage?: string | null;
  bio?: string | null;
  points?: number;
}

/**
 * Master Item Interface
 */
export interface Item {
  id: number;
  name: string;
  description?: string | null;
  imageUrl: string;
  type: ItemType;
  createdAt: string | Date;
}

/**
 * User Inventory Interface
 */
export interface UserInventory {
  id: number;
  userId: string;
  itemId: number;
  quantity: number;
  createdAt: string | Date;
  item?: Item; // Optional relation
}

/**
 * User Sticker Placement Interface
 */
export interface UserStickerPlacement {
  id: number;
  userId: string;
  itemId: number;
  x: number;
  y: number;
  rotation: number;
  placedAt: string | Date;
  item?: Item; // Optional relation
}
