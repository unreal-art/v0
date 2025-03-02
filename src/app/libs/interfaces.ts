export interface IPhoto {
    id: string;
    src: string;
    author?: string;
}

export interface IUser {
    wallet: JSON;
    bio: string | null;
    location: string | null;
    likesReceived: number;
    creditBalance: number;
    full_name: string | null;
    avatar_url: string | null;
}