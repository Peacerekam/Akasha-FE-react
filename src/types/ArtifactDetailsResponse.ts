export type ArtifactDetailsResponse = {
  artifact: any;
  builds: {
    name: string;
    type: string;
    icon: string;
    characterId: number;
    artifacts: string[];
    critValue: number;
    artifactSets: any;
    calculations: any;
    weapon: any;
    stats: any;
  }[];
};
