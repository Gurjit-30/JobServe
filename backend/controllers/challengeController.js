const challenges = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    markdown: `
# Two Sum

## Problem Statement
Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.
You may assume that each input would have ***exactly* one solution**, and you may not use the same element twice.
You can return the answer in any order.

## Constraints
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- **Only one valid answer exists.**

## Example Test Cases

### Example 1:
**Input:** \`nums = [2,7,11,15]\`, \`target = 9\`  
**Output:** \`[0,1]\`  
**Explanation:** Because \`nums[0] + nums[1] == 9\`, we return \`[0, 1]\`.

### Example 2:
**Input:** \`nums = [3,2,4]\`, \`target = 6\`  
**Output:** \`[1,2]\`  

### Example 3:
**Input:** \`nums = [3,3]\`, \`target = 6\`  
**Output:** \`[0,1]\`  
    `
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    markdown: `
# Reverse String

## Problem Statement
Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array in-place with \`O(1)\` extra memory.
For this test, assume you can just read a string from stdin and print the reversed string to stdout.

## Constraints
- \`1 <= s.length <= 10^5\`
- \`s[i]\` is a printable ascii character.

## Example Test Cases

### Example 1:
**Input:** \`hello\`  
**Output:** \`olleh\`  

### Example 2:
**Input:** \`world\`  
**Output:** \`dlrow\`  
    `
  }
];

exports.getDailyChallenge = (req, res) => {
  // Rotate challenges based on the current day (UTC)
  const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const dailyChallengeIndex = today % challenges.length;
  
  const dailyChallenge = challenges[dailyChallengeIndex];
  
  return res.json(dailyChallenge);
};
