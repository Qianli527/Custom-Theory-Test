import { ExponentialCost, FirstFreeCost, LinearCost, CustomCost } from "./api/Costs"; 
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";

var id = "differentiation";
var name = "Differentiation";
var description = "A try of differentiation."
var authors = "QianLi
var version = 1;

var currency;
var c1, c2, c3;
var x1, x2;
var c1Exp, x1Exp;

var init = () => {
    currency = theory.createCurrency();

    ///////////////////
    // Regular Upgrades

    // c1
    {
        let getDesc = (level) => "c_1=" + getC1(level).toString(0);
        let getInfo = (level) => "c_1=" + getC1(level).toString(0);
        c1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(5, Math.log2(2))));
        c1.getDescription = (amount) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
    }

    // c2
    {
        let getDesc = (level) => "c_2=2^{" + level + "}";
        let getInfo = (level) => "c_2=" + getC2(level).toString(0);
        c2 = theory.createUpgrade(1, currency, new ExponentialCost(5, Math.log2(10)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    // c3
    {
        let getDesc = (level) => "c_3=3^{" + level + "}";
        let getInfo = (level) => "c_3=" + getC2(level).toString(0);
        c3 = theory.createUpgrade(2,  currency, new ExponentialCost(5, Math.log2(100)));
        c3.getDescription = (_) => Utils.getMath(getDesc(c3.level));
        c3.getInfo = (amount) => Utils.getMathTo(getInfo(c3.level), getInfo(c3.level + amount));
    }
  
  // x1
    {
        let getDesc = (level) => "x_1=" + getC1(level).toString(0);
        let getInfo = (level) => "x_1=" + getC1(level).toString(0);
        x1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(5, Math.log2(2))));
        x1.getDescription = (amount) => Utils.getMath(getDesc(c1.level));
        x1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
    }

    // x2
    {
        let getDesc = (level) => "c_2=2^{" + level + "}";
        let getInfo = (level) => "c_2=" + getC2(level).toString(0);
        x2 = theory.createUpgrade(1, currency, new ExponentialCost(5, Math.log2(10)));
        x2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        x2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e8);
    theory.createBuyAllUpgrade(1, currency, 1e15);
    theory.createAutoBuyerUpgrade(2, currency, 1e25);

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(10, 15));

    {
        c1Exp = theory.createMilestoneUpgrade(0, 3);
        c1Exp.description = Localization.getUpgradeIncCustomExpDesc("c_1", "0.05");
        c1Exp.info = Localization.getUpgradeIncCustomExpInfo("c_1", "0.05");
        c1Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    {
        x1Exp = theory.createMilestoneUpgrade(1, 3);
        x1Exp.description = Localization.getUpgradeIncCustomExpDesc("x_1", "0.05");
        x1Exp.info = Localization.getUpgradeIncCustomExpInfo("x_1", "0.05");
        x1Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }
  
    updateAvailability();
}

var updateAvailability = () => {

}

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    currency.value += dt * bonus * getC1(c1.level).pow(getC1Exponent(c1Exp.level)) *
                                   getC2(c2.level).pow(getC2Exponent(c2Exp.level)) *
                                   getC3(c3.level).pow(getC3Exponent(c3Exp.level));
}

var getPrimaryEquation = () => {
    let result = "\\dot{\\rho} = c_1";

    if (c1Exp.level == 1) result += "^{1.05}";
    if (c1Exp.level == 2) result += "^{1.1}";
    if (c1Exp.level == 3) result += "^{1.15}";

    result += "x_1";

    if (x1Exp.level == 1) result += "^{1.05}";
    if (x1Exp.level == 2) result += "^{1.1}";
    if (x1Exp.level == 3) result += "^{1.15}";

    return result;
}


var getSecondaryEquation = () => {
   theory.primaryEquationHeight = 90;
    let result = "\\begin{matrix}"
    result += "\\dot{\\rho}=x1";
    result += "\\dot{\\rho}=x2";
    result += "\\end{matrix}"
    return result;
}

var getPublicationMultiplier = (tau) => tau.pow(0.164) / BigNumber.THREE;
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{0.164}}{3}";
var getTau = () => currency.value;
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getC2 = (level) => BigNumber.TWO.pow(level);
var getC3 = (level) => BigNumber.THREE.pow(level);
var getC1Exponent = (level) => BigNumber.from(1 + 0.05 * level);
var getC2Exponent = (level) => BigNumber.from(1 + 0.05 * level);
var getC3Exponent = (level) => BigNumber.from(1 + 0.05 * level);

init();
