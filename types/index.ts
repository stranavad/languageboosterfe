export interface Project {
    id: number;
    name: string;
    spaceId: number;
}

export interface Space {
    id: number;
    name: string;
    users: User[]; // is not always filled
    projects: Project[]; // is not always filled
}

export interface User {
    id: number;
    name: string;
    username: string;
}

export interface Language {
    id: number;
    name: string;
    projectId: number;
}

export interface Mutation {
    id: number;
    key: string;
    status: string;
    values: MutationValue[]
}

export interface MutationValue {
    id: number;
    value: string;
    status: string;
    languageId: number;
}
