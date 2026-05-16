import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../index.css"; // Ensure styles are applied

export default function ProblemDescription() {
  const markdownContent = `
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
  `;

  return (
    <div className="problem-description-wrapper animate-fade-in-scale">
      <div className="problem-header">
        <div className="problem-title">
          <span className="problem-icon">📝</span>
          <div>
            <h2 className="problem-heading">Problem Description</h2>
            <p className="problem-sub">Read carefully before solving</p>
          </div>
        </div>
        <div className="problem-difficulty">
          <span className="difficulty-badge easy">Easy</span>
        </div>
      </div>
      <div className="problem-body">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          className="markdown-body"
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
