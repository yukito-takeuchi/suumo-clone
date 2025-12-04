#!/usr/bin/env node

const { execSync } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const PR_TYPES = {
  1: { emoji: "✨", label: "feat", description: "新機能" },
  2: { emoji: "🐛", label: "fix", description: "バグ修正" },
  3: { emoji: "♻️", label: "refactor", description: "リファクタリング" },
  4: { emoji: "📝", label: "docs", description: "ドキュメント" },
  5: { emoji: "🎨", label: "style", description: "スタイル改善" },
  6: { emoji: "⚡", label: "perf", description: "パフォーマンス改善" },
  7: { emoji: "🧪", label: "test", description: "テスト追加" },
};

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("\n📋 PR作成ツール\n");

  // 現在のブランチ確認
  let currentBranch;
  try {
    currentBranch = execSync("git branch --show-current", {
      encoding: "utf-8",
    }).trim();
    console.log(`現在のブランチ: ${currentBranch}\n`);
  } catch (error) {
    console.error("❌ Gitブランチの取得に失敗しました");
    process.exit(1);
  }

  // PRタイプ選択
  console.log("PRの種類を選択してください:");
  Object.entries(PR_TYPES).forEach(([key, value]) => {
    console.log(`${key}. ${value.emoji} ${value.description}`);
  });

  const typeChoice = await question("\n選択 (1-7): ");
  const prType = PR_TYPES[typeChoice];

  if (!prType) {
    console.error("❌ 無効な選択です");
    rl.close();
    process.exit(1);
  }

  // Notion ID入力
  const notionId = await question("\nNotion ID (例: TWT-001): ");

  if (!notionId.trim()) {
    console.error("❌ Notion IDは必須です");
    rl.close();
    process.exit(1);
  }

  // タイトル入力
  const title = await question("\nPRタイトル: ");

  if (!title.trim()) {
    console.error("❌ タイトルは必須です");
    rl.close();
    process.exit(1);
  }

  // 最終的なPRタイトル
  const fullTitle = `[${notionId}] ${prType.emoji} ${title}`;

  // PR本文作成
  const prBody = `## 概要
${title}

## 変更内容
- 

## Notion
[${notionId}]

## Type
${prType.label} ${prType.description}
`;

  console.log("\n" + "=".repeat(50));
  console.log(`📝 作成するPR:`);
  console.log(`タイトル: ${fullTitle}`);
  console.log(`ブランチ: ${currentBranch} → main`);
  console.log("=".repeat(50) + "\n");

  const confirm = await question("このPRを作成しますか? (y/n): ");

  if (confirm.toLowerCase() === "y" || confirm.toLowerCase() === "yes") {
    try {
      // PRを作成
      execSync(
        `gh pr create --title "${fullTitle}" --body "${prBody}" --base main --head ${currentBranch}`,
        { stdio: "inherit" }
      );
      console.log("\n✅ PR作成完了!\n");
    } catch (error) {
      console.error("\n❌ PR作成に失敗しました");
      console.error(
        "エラー: 既にPRが存在するか、リモートブランチがない可能性があります\n"
      );
      process.exit(1);
    }
  } else {
    console.log("\n❌ PR作成をキャンセルしました\n");
  }

  rl.close();
}

main();
