// add functions reset all
// set integrity rules . what if user does not add anything but push reset btn


//***************************************************//
//**************** BUDGET COTROLLER *************//
//***************************************************// 
var budgetController = (function(){
    var Expenses = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expenses.prototype.calcPercentage = function(totalIncome, curBudget) {
        if(totalIncome > 0 && curBudget > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    };
    Expenses.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        } ,
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            
            //generating id for new item or object
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }
            
            // adding new expense or income
            if(type === 'exp') {
                newItem = new Expenses(ID, des, val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            
            // adding item to our data structure
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        
        removeItem: function(type, id) {
            var ids, index;
            
// a lot like forEach but map returns an array result collected after calling function on every element of array
            ids = data.allItems[type].map(function(current) {   
                return current.id;                              
            });
            
            // finding index of the element using id or return -1 if element not found
            index = ids.indexOf(id);
            
            //splice(starting index, how many elements)
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        
        resetList: function() {
            
        },
        
        calculateBudget: function() {
            // calc total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calc budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calc percentages
            if(data.totals.inc > 0 && data.budget > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc * 100));
            }
            else {
                data.percentage = -1;
            }
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc, data.budget);
            });
        },
        
        getPercentages: function() {
            var expPercentages = data.allItems.exp.map(function(cur) {
                return {id: cur.id, pencentage: cur.percentage};        // we have a getPercentage proto also
            });
            // for testing - console.log(expPercentages);
            return expPercentages;
        },
        
        testing: function(){
            console.log(data);
        }
    }
})();


//***************************************************//
//**************** UI CONTROLLER *************//
//***************************************************//
var UIController = (function(){
    var DOMInput = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: '.add__btn',
        resetBtn: '.reset__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    
    formatNumber = function(num, type) {
            /* + or - before all number
                2 digits after the decimal point
                comma in thousand
                ex 2000 -> 2,000.00
                ex 2345.236 -> 2,345.24
                ex 12345.56 -> 12,345.56
            */
            var numSplit, int, dec;
            
            num = Math.abs(num);        // making it positive
            num = num.toFixed(2);      // setting precision
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            dec = numSplit[1];
            if(int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            
            return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;  
        };
    
    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMInput.inputType).value,   // value will be either inc or exp
                description: document.querySelector(DOMInput.inputDescription).value,
                value: parseFloat(document.querySelector(DOMInput.inputValue).value)
            };
        },
        
        addListItem: function(obj, type){
            var html, newHtml, element;
            // create HTML string with placeholders
            if(type === 'inc'){
                element = DOMInput.incomeContainer; 
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'exp'){
                element = DOMInput.expensesContainer;
                html =  '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'; 
            }
            
            
            // replace the placeholders with corresponding values
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // insert the new HTML into DOM
            document.querySelector(element).insertAdjacentHTML('BeforeEnd', newHtml)
            
        },
        
        removeListItem: function(typeID) {
            var el = document.getElementById(typeID);
            el.parentNode.removeChild(el);
        },
        
        resetUI: function() {
            var incItemID, expItemID, allItemID = [];
            
            // fetch all the children of income list(from which we can extract itemid's required to call removeItem)
            incItemID = document.querySelector('.income__list').children;
            incItemID = Array.prototype.slice.call(incItemID);
            
            expItemID = document.querySelector('.expenses__list').children;
            expItemID = Array.prototype.slice.call(expItemID);

            // extracting all itemID for income
            incItemID.forEach(function(cur) {
                allItemID.push(cur.id); 
            });
            // extracting all itemID for expenses
            expItemID.forEach(function(cur) {
                allItemID.push(cur.id); 
            });
            
            return allItemID;
        },
        
        // clear fields after each new entry
        clearFields: function() {
            var allFields, fieldsArr;
            
            // fetching the input elements all at once
            allFields = document.querySelectorAll(DOMInput.inputDescription + ', ' + DOMInput.inputValue);
            
            // allFields was a list so to covert it into an array
            fieldsArr = Array.prototype.slice.call(allFields);
            
            // using foreach(function(current, index, Array){})
            fieldsArr.forEach(function(cur){
                cur.value = '';
            })
            
            // setting focus to the description field
            allFields[0].focus();
        },
        
        updateBudgetUI: function(currentBudget) {
            var type;
            currentBudget.budget > 0 ? type = 'inc' : type = 'dec';
            document.querySelector(DOMInput.budgetLabel).textContent = formatNumber(currentBudget.budget, type);
            document.querySelector(DOMInput.incomeLabel).textContent = formatNumber(currentBudget.totalInc, 'inc');
            document.querySelector(DOMInput.expensesLabel).textContent = formatNumber(currentBudget.totalExp, 'dec');
            if(currentBudget.percentage > 0) {
                document.querySelector(DOMInput.percentageLabel).textContent = currentBudget.percentage + '%';
            }
            else {
                document.querySelector(DOMInput.percentageLabel).textContent = '---';
            }
        },
        
        upadatePercentagesUI: function(currentPercentages) {
            currentPercentages.forEach(function(cur) {
                if(cur.pencentage > 0) {
                    document.getElementById('exp-' + cur.id).querySelector(DOMInput.itemPercentage).textContent = cur.pencentage + '%';
                }
                else {
                   document.getElementById('exp-' + cur.id).querySelector(DOMInput.itemPercentage).textContent = '---';
                }
            });
        },
        
        displayDate: function() {
            var now, year, month;
            
            now = new Date();
            
            month = now.getMonth(); // return's int (zero based)
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            year = now.getFullYear();
            
            document.querySelector(DOMInput.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function() {
            var fields;
            fields = document.querySelectorAll (
                DOMInput.inputType + ',' +
                DOMInput.inputDescription + ',' +
                DOMInput.inputValue);
            
            nodeListForEach = function(list, callback){            //resuable function structure
                for(var i = 0; i < list.length; i++) {
                    callback(list[i]);
                }
            };
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMInput.inputBtn).classList.toggle('red');
            
        },
            
        getDOMInput: function() {
            return DOMInput;
        }
    }
})();


//***************************************************//
//*************** GLOBAL APP CONTROLLER *************//
//***************************************************//
var controller = (function(budgetCtrl, UICtrl){
    var setupEventListeners = function(){
        // fetching the DOMInput
        var DOM = UICtrl.getDOMInput();
        
        // when add btn is clicked
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        // when enter is pressed anywhere on the screen
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.resetBtn).addEventListener('click', ctrlReset);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function() {
        var budget;
        
        // 1. Calculate Budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on UI
        UICtrl.updateBudgetUI(budget);
    };
    
    var updatePercentages = function() {
        var allExpensesPercentage;
        // 1. Calculate Percentages
        budgetCtrl.calculatePercentages();
        
        // 2. get Percentages from the Budget Controller
        allExpensesPercentage = budgetCtrl.getPercentages();
        
        // 3. Display the percentages on UI
        UICtrl.upadatePercentagesUI(allExpensesPercentage);
    };
    
    var ctrlAddItem = function()
    {
        var input, newItem;
        
        // 1. Get input field data
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            // 2. Add item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clearing the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
            
            // 6. Calculate and update Percentages
            updatePercentages();
        }
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        // get the correct html element using event bubbling
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID)
            {
                // split -> inc-1 to 'inc' and '1' array
                splitID = itemID.split('-');
                type = splitID[0];
                ID = parseInt(splitID[1]);
                
                // 1. remove item from data structure
                budgetCtrl.removeItem(type, ID);
                
                // 2. remove item from UI
                UICtrl.removeListItem(itemID);
                
                // 3. update the budget
                updateBudget();
                
                // 4. Calculate and update Percentages
                updatePercentages();
            }
    };
    
    var ctrlReset = function() {
        var allItem;
         // 1 get all the html list elements from the parent element using querySelectorAll store it in an array
        allItem = UICtrl.resetUI(); 
        
        // 2.clear UI list entries and reset Budget UI
        
            // 1.clear data structure call ctrlDeleteItem for each item
            allItem.forEach(function(cur) {
                var splitID, type, id;
        
                splitID = cur.split('-');
                type = splitID[0];
                id = splitID[1];
                
                budgetCtrl.removeItem(type, parseInt(id));
            });
        
            // 2 remove items from ui
            allItem.forEach(function(cur) {
                UICtrl.removeListItem(cur); 
            });
        
        // 3.Reset Budget
        UICtrl.updateBudgetUI({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
        });
        
    };
    
   return {
       init: function(){
           console.log("application has started.");
           UICtrl.displayDate();
           UICtrl.updateBudgetUI({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
           });
           setupEventListeners();
       }
   }
    
})(budgetController, UIController);

controller.init();



















