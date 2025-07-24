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

const coinDisplay = document.getElementById("coin-display");
const clickButton = document.getElementById("click-button");
const upgradeClick = document.getElementById("upgrade-click");
const upgradeAuto = document.getElementById("upgrade-auto");
const upgradeDouble = document.getElementById("upgrade-double");
const upgradeCrit = document.getElementById("upgrade-crit");
const upgradeAutoClicker = document.getElementById("upgrade-autoclicker");

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
        doubleClickPower: doubleClickPower
    };
    localStorage.setItem("idleClickerSave", JSON.stringify(gameData));
  }
  
  function loadGame() {
    const savedData = localStorage.getItem("idleClickerSave");
    if (savedData) {
        const gameData = JSON.parse(savedData);
        coins = gameData.coins;
        coinsPerClick = gameData.coinsPerClick;
        coinsPerSecond = gameData.coinsPerSecond;
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
        updateDisplay();
    }
  }  

loadGame();

  function updateDisplay() {
    coinDisplay.textContent = `Coins: ${coins}`;

    upgradeClick.textContent = `Upgrade Click (+${upgradeClickLevel + 1} per click) - Cost: ${upgradeClickCost}`;
    upgradeAuto.textContent = `Upgrade Auto Gain (+${upgradeAutoLevel + 1} per sec) - Cost: ${upgradeAutoCost}`;

    upgradeDouble.textContent = `Double Click Power (30s) - Cost: ${upgradeDoubleCost}`;
    upgradeCrit.textContent = `Critical Click Chance (+${critChance + 5}%) - Cost: ${upgradeCritCost}`;
    upgradeAutoClicker.textContent = `Auto Clicker (+1 click/sec) - Cost: ${upgradeAutoClickerCost}`;

    upgradeClick.disabled = coins < upgradeClickCost;
    upgradeAuto.disabled = coins < upgradeAutoCost;
    upgradeDouble.disabled = coins < upgradeDoubleCost;
    upgradeCrit.disabled = coins < upgradeCritCost;
    upgradeAutoClicker.disabled = coins < upgradeAutoClickerCost;

    if (doubleClickPower) {
        coinDisplay.textContent += ` | Double Click Power: ${doubleClickRemainingTime}s remaining`;
    }      

    coinDisplay.classList.remove("gain");
    void coinDisplay.offsetWidth; // forces reflow to restart animation
    coinDisplay.classList.add("gain");
  }
  

clickButton.addEventListener("click", () => {
    let clickGain = coinsPerClick * clickMultiplier;

    // Check for critical hit
    if (Math.random() * 100 < critChance) {
        clickGain *= 2;
    }

    coins += clickGain;
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

const resetButton = document.getElementById("reset");
resetButton.addEventListener("click", () => {
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
  
      saveGame();
      updateDisplay();
    }
});
  

clickButton.addEventListener("click", () => {
    let clickGain = coinsPerClick;
  
    // Check for critical hit
    if (Math.random() * 100 < critChance) {
      clickGain *= 2;
    }
  
    coins += clickGain;
    updateDisplay();
});

// Auto gain loop
setInterval(() => {
  coins += coinsPerSecond;
  updateDisplay();
}, 300);

setInterval(() => {
    coins += coinsPerSecond;
    updateDisplay();
  }, 1000);
  
  setInterval(() => {
    coins += autoClicker * coinsPerClick;
    updateDisplay();
  }, 1000);  

setInterval(() => {
    saveGame();
  }, 500); // saves every 5 seconds

updateDisplay(); 