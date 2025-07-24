let coins = 0;
let coinsPerClick = 1;
let coinsPerSecond = 0;
let clickMultiplier = 1;

// Upgrade Costs
let upgradeClickCost = 10;
let upgradeAutoCost = 50;

// Upgrade Levels
let upgradeClickLevel = 0;
let upgradeAutoLevel = 0;

// New Upgrades Costs
let upgradeDoubleCost = 100;
let upgradeCritCost = 200;
let upgradeAutoClickerCost = 500;

// Upgrade States
let critChance = 0; // as percentage
let autoClicker = 0; // clicks per second

// Double Click Power Status
let doubleClickPower = false;
let doubleClickRemainingTime = 0;
let doubleClickInterval; // to manage interval clear/start

// Prestige System
let prestigeLevel = 0;
let prestigeMultiplier = 1;
let prestigeThreshold = 10000; // e.g., 1 million coins to prestige

let soundOn = true;

const coinDisplay = document.getElementById("coin-display");
const clickButton = document.getElementById("click-button");
const upgradeClick = document.getElementById("upgrade-click");
const upgradeAuto = document.getElementById("upgrade-auto");
const upgradeDouble = document.getElementById("upgrade-double");
const upgradeCrit = document.getElementById("upgrade-crit");
const upgradeAutoClicker = document.getElementById("upgrade-autoclicker");
const prestigeButton = document.getElementById("prestige");
const achievements = [
    { id: "coins1000", name: "Rich!", description: "Earn 1,000 coins", unlocked: false, condition: () => coins >= 1000 },
    { id: "coins10000", name: "Millionaire!", description: "Earn 10,000 coins", unlocked: false, condition: () => coins >= 10000 },
    { id: "clicks10", name: "Clicker", description: "Purchase 10 click upgrades", unlocked: false, condition: () => upgradeClickLevel >= 10 },
    { id: "auto5", name: "Automation", description: "Purchase 5 auto gain upgrades", unlocked: false, condition: () => upgradeAutoLevel >= 5 },
  ];
const toggleSound = document.getElementById("toggle-sound");

function saveGame() {
    const gameData = {
        coins: coins,
        coinsPerClick: coinsPerClick,
        coinsPerSecond: coinsPerSecond,
        upgradeClickCost: upgradeClickCost,
        upgradeAutoCost: upgradeAutoCost,
        upgradeClickLevel: upgradeClickLevel,
        upgradeAutoLevel: upgradeAutoLevel,
        upgradeDoubleCost: upgradeDoubleCost,
        upgradeCritCost: upgradeCritCost,
        upgradeAutoClickerCost: upgradeAutoClickerCost,
        critChance: critChance,
        autoClicker: autoClicker,
        doubleClickPower: doubleClickPower,
        prestigeLevel: prestigeLevel,
        prestigeMultiplier: prestigeMultiplier,
        achievements: achievements,
        soundOn: soundOn
    };
    localStorage.setItem("idleClickerSave", JSON.stringify(gameData));
  }
  function loadGame() {
    const savedData = localStorage.getItem("idleClickerSave");
    if (savedData) {
        const gameData = JSON.parse(savedData); // It's safer to provide fallbacks in case the save data is from an older version
        coins = gameData.coins || 0;
        coinsPerClick = gameData.coinsPerClick || 1;
        coinsPerSecond = gameData.coinsPerSecond || 0;
        upgradeClickCost = (gameData.upgradeClickCost !== undefined) ? gameData.upgradeClickCost : 10;
        upgradeAutoCost = (gameData.upgradeAutoCost !== undefined) ? gameData.upgradeAutoCost : 50;
        upgradeClickLevel = gameData.upgradeClickLevel || 0;
        upgradeAutoLevel = gameData.upgradeAutoLevel || 0;
        upgradeDoubleCost = (gameData.upgradeDoubleCost !== undefined) ? gameData.upgradeDoubleCost : 100;
        upgradeCritCost = (gameData.upgradeCritCost !== undefined) ? gameData.upgradeCritCost : 200;
        upgradeAutoClickerCost = (gameData.upgradeAutoClickerCost !== undefined) ? gameData.upgradeAutoClickerCost : 500;
        critChance = gameData.critChance || 0;
        autoClicker = gameData.autoClicker || 0;
        doubleClickPower = gameData.doubleClickPower || false;
        prestigeLevel = gameData.prestigeLevel || 0;
        prestigeMultiplier = gameData.prestigeMultiplier || 1;
        if (gameData.achievements) {
            gameData.achievements.forEach((savedAch, index) => {
              achievements[index].unlocked = savedAch.unlocked;
            });
          }
          soundOn = (gameData.soundOn !== undefined) ? gameData.soundOn : true;
          toggleSound.textContent = `Toggle Sound: ${soundOn ? "ON" : "OFF"}`;
        updateDisplay();
    }
  }

loadGame();

  function updateDisplay() {
    // Use toLocaleString for better readability and floor to hide decimals
    const formattedCoins = Math.floor(coins).toLocaleString();
    let displayText = `Coins: ${formattedCoins}`;

    upgradeClick.textContent = `Upgrade Click (+${upgradeClickLevel + 1} per click) - Cost: ${upgradeClickCost.toLocaleString()}`;
    upgradeAuto.textContent = `Upgrade Auto Gain (+${upgradeAutoLevel + 1} per sec) - Cost: ${upgradeAutoCost.toLocaleString()}`;

    upgradeDouble.textContent = `Double Click Power (30s) - Cost: ${upgradeDoubleCost.toLocaleString()}`;
    upgradeCrit.textContent = `Critical Click Chance (+${critChance + 5}%) - Cost: ${upgradeCritCost.toLocaleString()}`;
    upgradeAutoClicker.textContent = `Auto Clicker (+1 click/sec) - Cost: ${upgradeAutoClickerCost.toLocaleString()}`;

    upgradeClick.disabled = coins < upgradeClickCost;
    upgradeAuto.disabled = coins < upgradeAutoCost;
    upgradeDouble.disabled = coins < upgradeDoubleCost;
    upgradeCrit.disabled = coins < upgradeCritCost;
    upgradeAutoClicker.disabled = coins < upgradeAutoClickerCost;

    displayText += ` | Prestige: ${prestigeLevel} (+${((prestigeMultiplier - 1) * 100).toFixed(0)}% coins)`;

    if (doubleClickPower) {
        displayText += ` | Double Click Power: ${doubleClickRemainingTime}s remaining`;
    }
    coinDisplay.textContent = displayText;

    coinDisplay.classList.remove("gain");
    void coinDisplay.offsetWidth; // forces reflow to restart animation
    coinDisplay.classList.add("gain");

    if (coins >= prestigeThreshold) {
        prestigeButton.style.display = "inline-block";
      } else {
        prestigeButton.style.display = "none";
    }
    const achievementsDiv = document.getElementById("achievements");
    achievementsDiv.innerHTML = "";

    achievements.forEach(a => {
    const status = a.unlocked ? "✅" : "❌";
    achievementsDiv.innerHTML += `${status} ${a.name}: ${a.description}<br>`;
    });
    checkAchievements();

  }

clickButton.addEventListener("click", () => {
    let clickGain = coinsPerClick * clickMultiplier;

    // Check for critical hit
    if (Math.random() * 100 < critChance) {
        clickGain *= 2;
    }

    coins += clickGain * prestigeMultiplier;
    updateDisplay();
});

upgradeClick.addEventListener("click", () => {
  if (coins >= upgradeClickCost) {
    coins -= upgradeClickCost;
    upgradeClickLevel += 1;
    coinsPerClick += upgradeClickLevel;
    upgradeClickCost = Math.max(1, Math.floor(upgradeClickCost * 1.2));
    updateDisplay();
  } else {
    alert("Not enough coins!");
  }
});

upgradeAuto.addEventListener("click", () => {
  if (coins >= upgradeAutoCost) {
    coins -= upgradeAutoCost;
    upgradeAutoLevel += 1;
    coinsPerSecond += upgradeAutoLevel;
    upgradeAutoCost = Math.max(1, Math.floor(upgradeAutoCost * 1.2));
    updateDisplay();
  }
});

upgradeDouble.addEventListener("click", () => {
    if (coins >= upgradeDoubleCost) {
      coins -= upgradeDoubleCost;
      upgradeDoubleCost = Math.floor(upgradeDoubleCost * 1.5);
  
      doubleClickRemainingTime += 30; // add 30s per purchase
  
      // Activate multiplier if not active
      if (!doubleClickPower) {
        doubleClickPower = true;
        clickMultiplier *= 2;
  
        doubleClickInterval = setInterval(() => {
          doubleClickRemainingTime--;
  
          if (doubleClickRemainingTime <= 0) {
            clearInterval(doubleClickInterval);
            doubleClickPower = false;
            clickMultiplier /= 2;
            doubleClickRemainingTime = 0;
          }
  
          updateDisplay();
        }, 1000);
      }
  
      updateDisplay();
    }
});
  
upgradeCrit.addEventListener("click", () => {
if (coins >= upgradeCritCost) {
    coins -= upgradeCritCost;
    upgradeCritCost = Math.floor(upgradeCritCost * 1.5);
    critChance += 5;
    updateDisplay();
}
});

upgradeAutoClicker.addEventListener("click", () => {
if (coins >= upgradeAutoClickerCost) {
    coins -= upgradeAutoClickerCost;
    upgradeAutoClickerCost = Math.floor(upgradeAutoClickerCost * 1.5);
    autoClicker += 1;
    updateDisplay();
}
});

// function resetProgress(isPrestige = false) {
//     coins = 0;
//     coinsPerClick = 1;
//     coinsPerSecond = 0;
//     clickMultiplier = 1;
//     upgradeClickCost = 10;
//     upgradeAutoCost = 50;
//     upgradeClickLevel = 0;
//     upgradeAutoLevel = 0;
//     upgradeDoubleCost = 100;
//     upgradeCritCost = 200;
//     upgradeAutoClickerCost = 500;
//     critChance = 0;
//     autoClicker = 0;
//     doubleClickPower = false;
//     doubleClickRemainingTime = 0;
//     if (doubleClickInterval) {
//       clearInterval(doubleClickInterval);
//       doubleClickInterval = null;
//     }

//     if (!isPrestige) {
//         prestigeLevel = 0;
//         prestigeMultiplier = 1;
//     }

//     saveGame();
//     updateDisplay();
// }

const resetGame = document.getElementById("reset-game");

resetGame.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset your progress?")) {
    coins = 0;
    coinsPerClick = 1;
    coinsPerSecond = 0;

    upgradeClickCost = 10;
    upgradeAutoCost = 50;
    upgradeClickLevel = 0;
    upgradeAutoLevel = 0;

    upgradeDoubleCost = 100;
    upgradeCritCost = 200;
    upgradeAutoClickerCost = 500;

    critChance = 0;
    autoClicker = 0;

    clickMultiplier = 1;
    doubleClickPower = false;
    doubleClickRemainingTime = 0;
    if (doubleClickInterval) {
      clearInterval(doubleClickInterval);
    }

    prestigeLevel = 0;
    prestigeMultiplier = 1;

    // Reset achievements
    achievements.forEach(a => a.unlocked = false);

    saveGame();
    updateDisplay();
  }
});



prestigeButton.addEventListener("click", () => {
    if (coins >= prestigeThreshold) {
      prestigeLevel += 1;
      prestigeMultiplier = 1 + prestigeLevel * 0.10; // +10% per prestige
      resetProgress(true);
      alert(`Prestiged! Your coin gains are now multiplied by ${prestigeMultiplier.toFixed(2)}x`);
    }
  });

function checkAchievements() {
    achievements.forEach(achievement => {
        if (!achievement.unlocked && achievement.condition()) {
        achievement.unlocked = true;
        showAchievementPopup(achievement);
        saveGame(); // Save achievement state
        }
});
}

function showAchievementPopup(achievement) {
    const popup = document.getElementById("achievement-popup");
    popup.textContent = `Achievement Unlocked: ${achievement.name}!`;
    popup.style.display = "block";
    setTimeout(() => {
      popup.style.display = "none";
    }, 3000);
}

toggleSound.addEventListener("click", () => {
    soundOn = !soundOn;
    toggleSound.textContent = `Toggle Sound: ${soundOn ? "ON" : "OFF"}`;
    saveGame();
  });

// Auto gain loop
setInterval(() => {
    const passiveGain = coinsPerSecond;
    const autoClickGain = autoClicker * coinsPerClick;
    coins += (passiveGain + autoClickGain) * prestigeMultiplier;
    updateDisplay();
  }, 1000);

setInterval(() => {
    saveGame();
  }, 5000); // saves every 5 seconds

updateDisplay();