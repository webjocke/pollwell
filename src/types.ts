export type Data = {
  activePoll: string | null;
  polls: { [key: string]: Poll };
  wordCloudResults: { pollId: string; word: string }[];
  rankResults: { optionId: string; rank: number }[];
};

export type Poll =
  | { type: "wordCloud"; question: string }
  | { type: "rank"; title: string; options: { [key: string]: string } };

export type Action =
  | { action: "writePoll"; pollId: string; newPoll: Poll }
  | {
      action: "writeOptionText";
      pollId: string;
      optionId: string;
      optionText: string;
    }
  | { action: "writeRankTitle"; pollId: string; title: string }
  | { action: "voteWordCloud"; pollId: string; word: string }
  | { action: "voteRank"; optionId: string; rank: string }
  | { action: "setActivePoll"; pollId: string | null }
  | { action: "addOption"; pollId: string }
  | { action: "removeOption"; pollId: string; optionId: string }
  | { action: "removePoll"; pollId: string };
