//PART 2
// State management
let currentTab2 = 0;
let selectedService2 = '';
let selectedOptions = {
    cleaningType: '',
    beds: 1, // Changed from 2 to 1 to match default
    baths: 1,
    frequency: 'once-off',
    recurringFrequency: '',
    officeSize: '',
    constructionType: null,
    squareMeters: 0, // Add square meters for by-meter pricing
    addons: []
};

// Track which tabs are accessible
let accessibleTabs = [true, false, false, false]; // Only first tab is accessible initially

// Pricing logic
const pricing = {
    residential: {
        standard: { perRoom: 300 },
        deep: { perRoom: 475 },
        move: { base: 1400, perRoom: 80 }
    },
    green: {
        1: 700, // Added price for 1 bedroom
        2: 1000,
        3: 1500,
        4: 2200
    },
    recurring: {
        1: { weekly: 400, biweekly: 500, monthly: 600 },
        2: { weekly: 600, biweekly: 800, monthly: 900 },
        3: { weekly: 1000, biweekly: 1200, monthly: 1500 },
        4: { weekly: 1500, biweekly: 1800, monthly: 2200 }
    },
    construction: {
        small: 1500,
        medium: 3000,
        large: 6000,
        perSquareMeter: { min: 25, max: 50 } // R25-R50 per square meter
    },
    office: {
    onceOff: {
        small: 1200,   // Custom once-off price
        medium: 1800,
        large: 2500
    },
    recurring: {
        small: 3500,   // Monthly
        medium: 4500,
        large: 6000  // This can be a placeholder. We'll show "Quote on request" if needed.
    }
   }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeServiceSelection();
    initializeOptions();
    initializeAddons();
    initializeContinueButton();
    initializeModal();
    initializeFormValidation();
    updateTabAccessibility(); // Initialize tab accessibility
    updatePrice();
});

function initializeTabs() {
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach((tab, index) => {
        tab.addEventListener('click', (e) => {
            // Prevent navigation if tab is not accessible
            if (!accessibleTabs[index]) {
                e.preventDefault();
                return;
            }
            
            // Only allow going back to previous tabs or staying on current tab
            if (index <= currentTab2) {
                switchTab(index);
            }
        });
    });
}

// Update tab accessibility and visual state
function updateTabAccessibility() {
    const tabItems = document.querySelectorAll('.tab-item');
    
    tabItems.forEach((tab, index) => {
        if (accessibleTabs[index]) {
            tab.classList.remove('disabled');
            tab.style.cursor = 'pointer';
            tab.style.opacity = '1';
        } else {
            tab.classList.add('disabled');
            tab.style.cursor = 'not-allowed';
            tab.style.opacity = '0.5';
        }
    });
}

// Check if current tab requirements are met
function isCurrentTabComplete() {
    switch (currentTab2) {
        case 0: // Service selection tab
            return selectedService2 !== '';
            
        case 1: // Options tab
            if (selectedService2 === 'residential') {
                return selectedOptions.cleaningType !== '';
            } else if (selectedService2 === 'office') {
                return selectedOptions.officeSize !== '';
            } else if (selectedService2 === 'post-construction') {
                return selectedOptions.constructionType !== '';
            } else if (selectedService2 === 'green') {
                // Must have frequency set
                if (!selectedOptions.frequency) return false;
                
                // If recurring, must also select recurring frequency
                if (selectedOptions.frequency === 'recurring') {
                    return selectedOptions.recurringFrequency !== '';
                }
                
                // If once-off, we're complete
                return true;
            }
            return false;
            
        case 2: // Your Information tab - CHECK ALL REQUIRED FIELDS
            const fullName = document.getElementById('full-name')?.value?.trim() || '';
            const email = document.getElementById('email')?.value?.trim() || '';
            const phone = document.getElementById('phone')?.value?.trim() || '';
            const date = document.getElementById('preferred-booking-date')?.value || '';
            const time = document.getElementById('preferred-time')?.value || '';
            const address = document.getElementById('address')?.value?.trim() || '';
            const bookingTypeSelected = document.querySelector('input[name="booking-type"]:checked');
            
            const isComplete = fullName && email && phone && date && time && address && bookingTypeSelected;
            
            console.log('Tab 2 completion check:', {
                fullName: !!fullName,
                email: !!email,
                phone: !!phone, 
                date: !!date,
                time: !!time,
                address: !!address,
                bookingType: !!bookingTypeSelected,
                isComplete: isComplete
            });
            
            return isComplete;
            
        case 3: // Confirmation tab
            return true;
            
        default:
            return false;
    }
}


// Update which tabs are accessible based on completion
function updateAccessibleTabs() {
    // Always allow access to current and previous tabs
    for (let i = 0; i <= currentTab2; i++) {
        accessibleTabs[i] = true;
    }
    
    // Allow access to next tab only if current tab is complete
    if (isCurrentTabComplete() && currentTab2 < 3) {
        accessibleTabs[currentTab2 + 1] = true;
    }
    
    updateTabAccessibility();
}

function initializeContinueButton() {
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', nextTab);
    }
}

// Modal functions - Fixed and integrated
function initializeModal() {
    const modal = document.getElementById('square-meter-modal');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancel-modal');
    const confirmBtn = document.getElementById('confirm-square-meters');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmSquareMeters);
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
}

function openModal() {
    const modal = document.getElementById('square-meter-modal');
    if (modal) {
        // Clear previous input
        const input = document.getElementById('square-meter-input');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 100); // Focus the input
        }
        
        // Show the modal
        modal.style.display = 'block';
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }
}

       function closeModal() {
    const modal = document.getElementById('square-meter-modal');
    if (modal) {
        modal.style.display = 'none';
        
        // Restore body scroll
        document.body.style.overflow = 'auto';
    }
}

 function confirmSquareMeters() {
    const input = document.getElementById('square-meter-input');
    const squareMeters = parseFloat(input.value);
    
    if (isNaN(squareMeters) || squareMeters <= 0) {
        alert('Please enter a valid square meter value');
        return;
    }
    
    selectedOptions.squareMeters = squareMeters;
    selectedOptions.constructionType = 'square-meter';
    
    // Update the display to show selected option
    const constructionTypes = document.querySelectorAll('.construction-type');
    constructionTypes.forEach(t => t.classList.remove('selected'));
    
    // Select the square-meter option
    const squareMeterOption = document.querySelector('.construction-type[data-construction="square-meter"]');
    if (squareMeterOption) {
        squareMeterOption.classList.add('selected');
    }
    
    updatePrice();
    updateContinueButton();
    updateAccessibleTabs();
    closeModal();
}


function updateConstructionTypeDisplay() {
    // You can add visual feedback here to show that by-meter option is selected
    // For example, highlight a button or show selected state
    console.log(`Selected: By square meter (${selectedOptions.squareMeters} sq m)`);
}

function switchTab(tabIndex) {
    // Prevent switching to inaccessible tabs
    if (!accessibleTabs[tabIndex]) {
        return;
    }
    
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remove active classes
    tabItems.forEach(item => item.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active classes
    tabItems[tabIndex].classList.add('active');
    tabContents[tabIndex].classList.add('active');
    
    currentTab2 = tabIndex;
    
    // If switching to options tab (tab 1), show appropriate service options
    if (tabIndex === 1 && selectedService2) {
        showServiceOptions(selectedService2);
        // Now update price when we're on the options tab
        updatePrice();
    }
    
    // If switching away from service selection tab, show price
    if (tabIndex !== 0 && selectedService2) {
        updatePrice();
    } else if (tabIndex === 0) {
        // Reset price display on service selection tab
        const priceDisplay = document.getElementById('total-price');
        if (priceDisplay) {
            priceDisplay.textContent = 'R0 ZAR';
        }
    }
    
    // If switching to green cleaning tab, ensure proper defaults
    if (tabIndex === 1 && selectedService2 === 'green') {
        selectedOptions.beds = 1;
        selectedOptions.baths = 1;
        selectedOptions.frequency = 'once-off';

        // Update the select elements to show correct values
        const greenBedsSelect = document.getElementById('green-beds');
        const greenBathsSelect = document.getElementById('green-baths');
        if (greenBedsSelect) greenBedsSelect.value = '1';
        if (greenBathsSelect) greenBathsSelect.value = '1';
        // Update price after setting defaults
        updatePrice();
    }
    
    updateContinueButton();
    updateAccessibleTabs();
    updateActionButtons();

}


function nextTab() {
    console.log('nextTab called, currentTab2:', currentTab2);
    console.log('isCurrentTabComplete():', isCurrentTabComplete());
    
    if (currentTab2 === 2 && isCurrentTabComplete()) {
        // Submit booking when moving from "Your Information" to "Booking Details"
        console.log('Submitting booking...');
        submitBooking();
    } else if (currentTab2 < 2 && isCurrentTabComplete()) {
        // Normal tab progression for tabs 0 and 1
        console.log('Moving to next tab...');
        switchTab(currentTab2 + 1);
    } else {
        console.log('Tab not complete or invalid progression');
    }
}

function initializeServiceSelection() {
    const serviceCards = document.querySelectorAll('[data-service]');
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove previous selection
            serviceCards.forEach(c => c.classList.remove('selected'));
            // Add selection to clicked card
            card.classList.add('selected');
            
            selectedService2 = card.dataset.service;
            
            // Don't show price on service selection tab (tab 0)
            if (currentTab2 !== 0) {
                updatePrice();
            } else {
                // Reset price display on service selection tab
                const priceDisplay = document.getElementById('total-price');
                if (priceDisplay) {
                    priceDisplay.textContent = 'R0 ZAR';
                }
            }
            
            updateContinueButton();
            updateAccessibleTabs();
        });
    });
}

function showServiceOptions(service) {
    // Hide all service options
    const allOptions = document.querySelectorAll('.service-options');
    allOptions.forEach(option => option.classList.add('hidden'));
    
    // Show selected service options
    const selectedOption = document.getElementById(`${service}-options`);
    if (selectedOption) {
        selectedOption.classList.remove('hidden');
    }
    
    // Update add-ons visibility
    updateAddonsVisibility(service);
}

function updateAddonsVisibility(service) {
    const applianceAddon = document.getElementById('appliance-addon');
    const garageAddon = document.getElementById('garage-addon');
    
    if (service === 'office') {
        applianceAddon.classList.add('hidden');
        garageAddon.classList.add('hidden');
    } else {
        applianceAddon.classList.remove('hidden');
        garageAddon.classList.remove('hidden');
    }
}

// Update the construction type initialization to work with your existing system
function initializeOptions() {
    // Residential cleaning type selection
    const cleaningTypes = document.querySelectorAll('.cleaning-type');
    cleaningTypes.forEach(type => {
        type.addEventListener('click', () => {
            cleaningTypes.forEach(t => t.classList.remove('selected'));
            type.classList.add('selected');
            selectedOptions.cleaningType = type.dataset.cleaning;
            updateContinueButton();
            updateAccessibleTabs();
            updatePrice();
        });
    });

    // Construction type selection - FIXED
    const constructionTypes = document.querySelectorAll('.construction-type');
    constructionTypes.forEach(type => {
        type.addEventListener('click', () => {
            const constructionType = type.dataset.construction;
            
            // If square-meter is clicked, open modal instead of regular selection
            if (constructionType === 'square-meter') {
                // Don't remove selection here - let the modal confirmation handle it
                openModal();
                return;
            }
            
            // Regular construction type selection
            constructionTypes.forEach(t => t.classList.remove('selected'));
            type.classList.add('selected');
            selectedOptions.constructionType = constructionType;
            
            // Reset square meters when selecting preset options
            selectedOptions.squareMeters = 0;
            
            updatePrice();
            updateContinueButton();
            updateAccessibleTabs();
        });
    });

    // Office type selection
    const officeTypes = document.querySelectorAll('.office-type');
    officeTypes.forEach(type => {
        type.addEventListener('click', () => {
            officeTypes.forEach(t => t.classList.remove('selected'));
            type.classList.add('selected');
            selectedOptions.officeSize = type.dataset.office;
            updateContinueButton();
            updateAccessibleTabs();
            updatePrice();
        });
    });

    // Beds and baths selection
    const bedsSelect = document.getElementById('beds');
    const bathsSelect = document.getElementById('baths');
    const greenBedsSelect = document.getElementById('green-beds');
    const greenBathsSelect = document.getElementById('green-baths');

    if (bedsSelect) {
        bedsSelect.addEventListener('change', () => {
            selectedOptions.beds = parseInt(bedsSelect.value);
            updateContinueButton();
            updateAccessibleTabs();
            updatePrice();
        });
    }

    if (bathsSelect) {
        bathsSelect.addEventListener('change', () => {
            selectedOptions.baths = parseInt(bathsSelect.value);
            updateContinueButton();
            updateAccessibleTabs();
            updatePrice();
        });
    }

    if (greenBedsSelect) {
        greenBedsSelect.addEventListener('change', () => {
            selectedOptions.beds = parseInt(greenBedsSelect.value);
            updatePrice();
        });
    }

    if (greenBathsSelect) {
        greenBathsSelect.addEventListener('change', () => {
            selectedOptions.baths = parseInt(greenBathsSelect.value);
            updatePrice();
        });
    }

    // Frequency selection (once-off vs recurring)
    const frequencyRadios = document.querySelectorAll('input[name="service-frequency"]');
    frequencyRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            selectedOptions.frequency = radio.value;
            toggleRecurringOptions('recurring-options', radio.value === 'recurring');
            updatePrice();
        });
    });

    const greenFrequencyRadios = document.querySelectorAll('input[name="green-frequency"]');
    greenFrequencyRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            selectedOptions.frequency = radio.value;
            toggleRecurringOptions('green-recurring-options', radio.value === 'recurring');
            updatePrice();
        });
    });

    const constructionFrequencyRadios = document.querySelectorAll('input[name="construction-frequency"]');
    constructionFrequencyRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            selectedOptions.frequency = radio.value;
            updatePrice();
        });
    });

    const officeFrequencyRadios = document.querySelectorAll('input[name="office-frequency"]');
    officeFrequencyRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            selectedOptions.frequency = radio.value;
            updatePrice();
        });
    });

    // Recurring frequency selection
    const recurringRadios = document.querySelectorAll('input[name="recurring-frequency"]');
    recurringRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            selectedOptions.recurringFrequency = radio.value;
            updatePrice();
        });
    });

    const greenRecurringRadios = document.querySelectorAll('input[name="green-recurring-frequency"]');
    greenRecurringRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            selectedOptions.recurringFrequency = radio.value;
            updatePrice();
            updateContinueButton(); 
            updateAccessibleTabs();
        });
    });
}

function initializeAddons() {
    // Initialize addons array
    selectedOptions.addons = [];
    
    // Add event listeners for addon checkboxes (if they exist)
    const addonCheckboxes = document.querySelectorAll('input[type="checkbox"][data-addon]');
    addonCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const addonName = checkbox.dataset.addon;
            if (checkbox.checked) {
                if (!selectedOptions.addons.includes(addonName)) {
                    selectedOptions.addons.push(addonName);
                }
            } else {
                selectedOptions.addons = selectedOptions.addons.filter(addon => addon !== addonName);
            }
            updatePrice();
        });
    });
}

function toggleRecurringOptions(sectionId, show) {
    const section = document.getElementById(sectionId);
    if (section) {
        if (show) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
            selectedOptions.recurringFrequency = '';
        }
    }
}



function calculatePrice() {
    let totalPrice = 0;
    
    if (!selectedService2) return totalPrice;

    if (selectedService2 === 'residential') {
        if (selectedOptions.frequency === 'recurring' && selectedOptions.recurringFrequency) {
            // Recurring pricing
            const beds = selectedOptions.beds;
            totalPrice = pricing.recurring[beds][selectedOptions.recurringFrequency] || 0;
        } else {
            // Once-off pricing
            const cleaningType = selectedOptions.cleaningType;
            if (cleaningType && pricing.residential[cleaningType]) {
                const beds = selectedOptions.beds;
                const baths = selectedOptions.baths;
                
                if (cleaningType === 'standard') {
                    totalPrice = beds * 300 + baths * 300;
                } else if (cleaningType === 'deep') {
                    totalPrice = beds * 475 + baths * 475;
                } else if (cleaningType === 'move') {
                    totalPrice = 1400 + (beds + baths - 1) * 80;
                }
            }
        }
    } else if (selectedService2 === 'green') {
        if (selectedOptions.frequency === 'recurring' && selectedOptions.recurringFrequency) {
            // Recurring pricing
            const beds = selectedOptions.beds;
            totalPrice = pricing.recurring[beds][selectedOptions.recurringFrequency] || 0;
        } else {
            // Once-off pricing
            const beds = selectedOptions.beds;
            totalPrice = pricing.green[beds] || 1000;
        }
    } else if (selectedService2 === 'post-construction') {
        // Updated post-construction pricing
        const constructionType = selectedOptions.constructionType;
        
        if (constructionType === 'square-meter' && selectedOptions.squareMeters > 0) {
            // Use average of min and max rate (R37.50 per square meter)
            const averageRate = (pricing.construction.perSquareMeter.min + pricing.construction.perSquareMeter.max) / 2;
            totalPrice = selectedOptions.squareMeters * averageRate;
        } else if (constructionType && pricing.construction[constructionType]) {
            totalPrice = pricing.construction[constructionType];
        } else {
            totalPrice = 1500; // Default to small job price
        }
    } else if (selectedService2 === 'office') {
        const officeSize = selectedOptions.officeSize;
        const frequency = selectedOptions.frequency;

        if (frequency === 'once-off') {
            totalPrice = pricing.office.onceOff[officeSize] || 0;
        } else if (frequency === 'recurring') {
            if (officeSize === 'large') {
                // Custom quote required
                totalPrice = 6000;
            } else if (officeSize === 'small'){
                totalPrice = 3500;
            } else {
                totalPrice = 4500;
            }
        }
    }

    // Add addon prices
    selectedOptions.addons.forEach(addon => {
        totalPrice += pricing.addons[addon] || 0;
    });

    return totalPrice;
}

// CORRECTED updatePrice function - replaces both conflicting versions
function updatePrice() {
    const price = calculatePrice();
    const priceDisplay = document.getElementById('total-price');
    const priceMessage = document.getElementById('price-message');
    
    if (priceDisplay) {
        priceDisplay.textContent = `R${price} ZAR`;
    }
    
   
}

function updateContinueButton() {
    const continueBtn = document.getElementById('continue-btn');
    
    if (currentTab2 === 0) {
        continueBtn.textContent = 'Continue to Options';
        continueBtn.disabled = !selectedService2;
    } else if (currentTab2 === 1) {
        continueBtn.textContent = 'Continue to Your Information';
        // For residential service, require cleaning type selection
        if (selectedService2 === 'residential') {
            continueBtn.disabled = !selectedOptions.cleaningType;
        } else if (selectedService2 === 'office') {
            continueBtn.disabled = !selectedOptions.officeSize;
        } else if (selectedService2 === 'post-construction') {
            continueBtn.disabled = !selectedOptions.constructionType;
        } else if (selectedService2 === 'green') {
            // Check if frequency is set
            if (!selectedOptions.frequency) {
                continueBtn.disabled = true;
            } else if (selectedOptions.frequency === 'recurring') {
                // If recurring, must have recurring frequency selected
                continueBtn.disabled = !selectedOptions.recurringFrequency;
            } else {
                // Once-off is complete
                continueBtn.disabled = false;
            }
        } else {
            continueBtn.disabled = false;
        }

    } else if (currentTab2 === 2) {
        continueBtn.textContent = 'Continue to Booking Details';
        
        // Check ALL required fields for the "Your Information" tab
        const fullName = document.getElementById('full-name')?.value?.trim() || '';
        const email = document.getElementById('email')?.value?.trim() || '';
        const phone = document.getElementById('phone')?.value?.trim() || '';
        const date = document.getElementById('preferred-booking-date')?.value || '';
        const time = document.getElementById('preferred-time')?.value || '';
        const address = document.getElementById('address')?.value?.trim() || '';
        const bookingTypeSelected = document.querySelector('input[name="booking-type"]:checked');
        
        // Enable button only if ALL required fields are filled
        continueBtn.disabled = !fullName || !email || !phone || !date || !time || !address || !bookingTypeSelected;
        
        console.log('Form validation check:', {
            fullName: !!fullName,
            email: !!email, 
            phone: !!phone,
            date: !!date,
            time: !!time,
            address: !!address,
            bookingType: !!bookingTypeSelected,
            buttonDisabled: continueBtn.disabled
        });
        
    } else if (currentTab2 === 3) {
        // Tab 3 is the confirmation tab - hide the button initially
        continueBtn.style.display = 'none';
    }

    updateActionButtons();

}

function updateActionButtons() {
    const continueBtn = document.getElementById('continue-btn');
    const whatsappBtn = document.getElementById('book-now-whatsapp');

    if (!continueBtn || !whatsappBtn) return;

    if (currentTab2 === 2) {
        // YOUR INFORMATION TAB
        whatsappBtn.style.display = 'inline-flex'; // show WhatsApp
        continueBtn.disabled = true;               // disable continue
    } else {
        // ALL OTHER TABS
        whatsappBtn.style.display = 'none';
        continueBtn.disabled = false;
    }
}



async function submitBooking() {
    // Show loading state
    const continueBtn = document.getElementById('continue-btn');
     // Show loading state
    const originalText = continueBtn.textContent;
    continueBtn.innerHTML = '<span class="loading-spinner"></span>Submitting...';
    continueBtn.disabled = true;
    
    // Switch to confirmation tab first
    switchTab(3);
    
    // Show loading in confirmation tab
    const confirmationTab = document.querySelector('.tab-content:nth-child(4)');
    confirmationTab.innerHTML = `
        <div class="booking-confirmation">
            <div class="loading-spinner" style="width: 40px; height: 40px; border-width: 4px; margin: 20px auto;"></div>
            <h2>Processing your booking...</h2>
            <p>Please wait while we submit your booking request.</p>
        </div>
    `;
    
    try {
        // Get form field values
        const fullName = document.getElementById('full-name')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const phone = document.getElementById('phone')?.value || '';
        const date = document.getElementById('preferred-booking-date')?.value || '';
        const time = document.getElementById('preferred-time')?.value || '';
        const address = document.getElementById('address')?.value || '';
        const specialInstructions = document.getElementById('special-instructions')?.value || '';
       const bookingType = document.querySelector('input[name="booking-type"]:checked')?.value || 'personal';


        // Collect booking data
      // COMPLETE booking data with ALL service information
        const bookingData = {
            name: fullName,
            email: email,
            phone: phone,
            date: date,
            time: time,
            bookingType: bookingType,
            address: address,
            additionalInfo: specialInstructions,
            // Service details - THIS WAS MISSING BEFORE
            serviceType: selectedService2,
            cleaningType: selectedOptions.cleaningType || 'Green Cleaning',
            beds: selectedOptions.beds,
            baths: selectedOptions.baths,
            frequency: selectedOptions.frequency,
            recurringFrequency: selectedOptions.recurringFrequency,
            officeSize: selectedOptions.officeSize,
            constructionType: selectedOptions.constructionType,
            squareMeters: selectedOptions.squareMeters,
            totalPrice: calculatePrice()
        };

        

        // Submit to Netlify function
       /* const response = await fetch('/.netlify/functions/send-booking-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        }); */

        // Redirect to WhatsApp with booking details
         openWhatsAppBooking(bookingData);

        const result = await response.json();

        if (response.ok && result.success) {
            // Show success confirmation
            showSuccessConfirmation(bookingData);
        } else {
            // Show error
            showErrorConfirmation(result.error || 'Failed to submit booking');
        }

    } catch (error) {
        console.error('Error submitting booking:', error);
        showErrorConfirmation(error.message);
    }
}


// ENHANCED: showSuccessMessage function (shows in current tab - tab 3)
function showSuccessConfirmation(bookingData) {
    const confirmationTab = document.querySelector('.tab-content:nth-child(4)');
    
    // Format the date and time for display
    const formattedDate = new Date(bookingData.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const formattedTime = new Date(`1970-01-01T${bookingData.time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    // Helper function to get service summary
    function getServiceSummary(data) {
        let summary = data.serviceType ? data.serviceType.charAt(0).toUpperCase() + data.serviceType.slice(1) : 'Cleaning Service';
        
        if (data.cleaningType) {
            summary += ` (${data.cleaningType})`;
        }
        if (data.beds || data.baths) {
            summary += ` - ${data.beds || 0} bed${(data.beds || 0) !== 1 ? 's' : ''}, ${data.baths || 0} bath${(data.baths || 0) !== 1 ? 's' : ''}`;
        }
        if (data.officeSize) {
            summary += ` (${data.officeSize} office)`;
        }
        if (data.constructionType) {
            if (data.constructionType === 'square-meter' && data.squareMeters) {
                summary += ` (${data.squareMeters} sq m)`;
            } else {
                summary += ` (${data.constructionType})`;
            }
        }
        if (data.frequency === 'recurring' && data.recurringFrequency) {
            summary += ` - ${data.recurringFrequency} recurring`;
        } else if (data.frequency === 'once-off') {
            summary += ' - Once-off';
        }
        
        return summary;
    }
    
    confirmationTab.innerHTML = `
        <div class="booking-confirmation">
            <div class="confirmation-icon">
             <img src="https://img.icons8.com/?size=100&id=11695&format=png&color=40C057" alt="Icon description">
             </div>
            <h2 class="confirmation-title">Booking Confirmed!</h2>
            <p>Thank you for choosing NiaImani Group Cleaning Services</p>
            
            <div class="confirmation-details">
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">${getServiceSummary(bookingData)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${bookingData.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${bookingData.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${bookingData.phone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${formattedTime}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Booking Type:</span>
                    <span class="detail-value">${bookingData.bookingType}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Estimated Price:</span>
                    <span class="detail-value" style="font-weight: bold; color: #667eea;">R${bookingData.totalPrice} ZAR</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${bookingData.address}</span>
                </div>
                ${bookingData.additionalInfo ? `
                <div class="detail-row">
                    <span class="detail-label">Special Instructions:</span>
                    <span class="detail-value">${bookingData.additionalInfo}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="note">
                <h3>What happens next?</h3>
                <p>1. <strong>Confirmation email sent</strong> - Check your inbox<br>
                2. <strong>We'll call you within 24 hours</strong> to confirm details<br>
                3. <strong>Final quote will be provided</strong> after consultation<br>
                4. <strong>Enjoy your sparkling clean space!</strong></p>
            </div>
        </div>
    `;
}

// Helper function to get service summary details
function getServiceSummary() {
    let serviceType = '';
    let details = '';
    
    switch (selectedService2) {
        case 'residential':
            serviceType = 'Residential Cleaning';
            details = `<strong>Cleaning Type:</strong> ${selectedOptions.cleaningType || 'Standard'}<br>
                      <strong>Bedrooms:</strong> ${selectedOptions.beds}<br>
                      <strong>Bathrooms:</strong> ${selectedOptions.baths}<br>
                      <strong>Frequency:</strong> ${selectedOptions.frequency === 'recurring' ? `Recurring (${selectedOptions.recurringFrequency})` : 'Once-off'}`;
            break;
            
        case 'green':
            serviceType = 'Green Cleaning';
            details = `<strong>Eco-friendly cleaning service</strong><br>
                      <strong>Bedrooms:</strong> ${selectedOptions.beds}<br>
                      <strong>Bathrooms:</strong> ${selectedOptions.baths}<br>
                      <strong>Frequency:</strong> ${selectedOptions.frequency === 'recurring' ? `Recurring (${selectedOptions.recurringFrequency})` : 'Once-off'}`;
            break;
            
        case 'post-construction':
            serviceType = 'Post-Construction Cleanup';
            if (selectedOptions.constructionType === 'square-meter') {
                details = `<strong>Project Size:</strong> ${selectedOptions.squareMeters} square meters<br>
                          <strong>Rate:</strong> R25-R50 per square meter`;
            } else {
                details = `<strong>Project Size:</strong> ${selectedOptions.constructionType || 'Medium'} job<br>
                          <strong>Type:</strong> Construction cleanup`;
            }
            break;
            
        case 'office':
            serviceType = 'Office/Commercial Cleaning';
            details = `<strong>Office Size:</strong> ${selectedOptions.officeSize || 'Medium'}<br>
                      <strong>Frequency:</strong> ${selectedOptions.frequency === 'recurring' ? 'Monthly recurring' : 'Once-off'}`;
            break;
            
        default:
            serviceType = 'Cleaning Service';
            details = 'Custom cleaning service';
    }
    
    return { serviceType, details };
}


function showErrorConfirmation(errorMessage) {
    const confirmationTab = document.querySelector('.tab-content:nth-child(4)');
    
    confirmationTab.innerHTML = `
        <div class="booking-confirmation">
            <div class="confirmation-icon">
              <img src="https://img.icons8.com/?size=100&id=3062&format=png&color=FA5252" alt="Icon description">
            </div>
            <h2 class="confirmation-title">Booking Failed</h2>
            <div class="error-message">
                <h3>We're sorry, but there was an error submitting your booking</h3>
                <p><strong>Error:</strong> ${errorMessage}</p>
                <p>Please try again or contact us directly at info@niaimanigroup.co.za</p>
                <button onclick="switchTab(2)" class="next-button">Go Back and Try Again</button>
            </div>
        </div>
    `;
}

// Optional: Function to reset the form after successful submission
function resetForm() {
    // Reset all form fields
    document.querySelectorAll('input, textarea, select').forEach(field => {
        if (field.type === 'radio' || field.type === 'checkbox') {
            field.checked = false;
        } else {
            field.value = '';
        }
    });
    
    // Reset selections
    document.querySelectorAll('.selected').forEach(element => {
        element.classList.remove('selected');
    });
    
    // Reset state
    selectedService2 = '';
    selectedOptions = {
        cleaningType: '',
        beds: 1,
        baths: 1,
        frequency: 'once-off',
        recurringFrequency: '',
        officeSize: '',
        constructionType: null,
        squareMeters: 0,
        addons: []
    };
    
    // Go back to first tab
    currentTab2 = 0;
    accessibleTabs = [true, false, false, false];
    switchTab(0);
    updatePrice();
}


        // Initialize construction type selection
        function initializeConstructionTypes() {
            const constructionTypes = document.querySelectorAll('.construction-type');
            constructionTypes.forEach(type => {
                type.addEventListener('click', () => {
                    const constructionType = type.dataset.construction;
                    
                    // If square-meter is clicked, open modal instead of regular selection
                    if (constructionType === 'square-meter') {
                        // Remove selection from other construction types first
                        constructionTypes.forEach(t => t.classList.remove('selected'));
                        openModal();
                        return;
                    }
                    
                    // Regular construction type selection
                    constructionTypes.forEach(t => t.classList.remove('selected'));
                    type.classList.add('selected');
                    selectedOptions.constructionType = constructionType;
                    
                    // Reset square meters when selecting preset options
                    selectedOptions.squareMeters = 0;
                    
                    updatePrice();
                });
            });
        }

        // Initialize everything when the page loads
        document.addEventListener('DOMContentLoaded', function() {
            initializeModal();
            initializeConstructionTypes();
        });


// Form validation for the details tab
document.addEventListener('input', (e) => {
    if (currentTab2 === 3) {
        updateContinueButton();
        updateAccessibleTabs();
    }
});

document.addEventListener('change', (e) => {
    if (currentTab2 === 3) {
        updateContinueButton();
        updateAccessibleTabs();
    }
});

document.addEventListener("DOMContentLoaded", function () {
  const serviceOptions = document.querySelectorAll(".service-option");

  serviceOptions.forEach(option => {
    option.addEventListener("click", function () {
      // Remove 'selected' from all options
      serviceOptions.forEach(opt => opt.classList.remove("selected"));
      
      // Add 'selected' to the clicked one
      this.classList.add("selected");
    });
  });
});

const radioButtons = document.querySelectorAll('input[name="booking-type"]');
        
        radioButtons.forEach(radio => {
            radio.addEventListener('change', function() {
                console.log('Selected booking type:', this.value);
            });
        });

// Assessment checkbox logic (only one can be selected)
const virtualAssessment = document.getElementById('virtual-assessment');
const onsiteAssessment = document.getElementById('onsite-assessment');

if (virtualAssessment && onsiteAssessment) {
    virtualAssessment.addEventListener('change', () => {
        if (virtualAssessment.checked) {
            onsiteAssessment.checked = false;
        }
    });

    onsiteAssessment.addEventListener('change', () => {
        if (onsiteAssessment.checked) {
            virtualAssessment.checked = false;
        }
    });
}


function initializeFormValidation() {
    // Add event listeners for all form inputs to trigger validation
    const formInputs = ['full-name', 'email', 'phone', 'preferred-booking-date', 'preferred-time', 'address'];
    
    formInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                if (currentTab2 === 2) {
                    updateContinueButton();
                    updateAccessibleTabs();
                }
            });
            
            input.addEventListener('change', () => {
                if (currentTab2 === 2) {
                    updateContinueButton();
                    updateAccessibleTabs();
                }
            });
        }
    });
    
    // Add listeners for booking type radio buttons
    const bookingTypeRadios = document.querySelectorAll('input[name="booking-type"]');
    bookingTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (currentTab2 === 2) {
                updateContinueButton();
                updateAccessibleTabs();
            }
        });
    });
}

function setDefaultBookingType() {
    const personalRadio = document.getElementById('personal');
    if (personalRadio && !document.querySelector('input[name="booking-type"]:checked')) {
        personalRadio.checked = true;
    }
}


//WHATSAPP BOOKING
function openWhatsAppBooking(bookingData) {
    const phoneNumber = "27728238385"; // WhatsApp number (no +)

    const message = `
Hello NiaImani Group 👋

I would like to book a cleaning service.

🧹 Service: ${bookingData.serviceType}
📋 Cleaning Type: ${bookingData.cleaningType}
🏠 Beds: ${bookingData.beds}
🚿 Baths: ${bookingData.baths}
🏢 Office Size: ${bookingData.officeSize || 'N/A'}
🏗 Construction Type: ${bookingData.constructionType || 'N/A'}
📐 Square Meters: ${bookingData.squareMeters || 'N/A'}

📅 Date: ${bookingData.date}
⏰ Time: ${bookingData.time}
📍 Address: ${bookingData.address}

👤 Name: ${bookingData.name}
📞 Phone: ${bookingData.phone}
📧 Email: ${bookingData.email}

💰 Estimated Price: R${bookingData.totalPrice} ZAR

📝 Notes: ${bookingData.additionalInfo || 'None'}
    `.trim();

    const encodedMessage = encodeURIComponent(message);

    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappURL, "_blank");
}


document.getElementById('book-now-whatsapp').addEventListener('click', () => {
    const bookingData = {
        name: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        date: document.getElementById('preferred-booking-date').value,
        time: document.getElementById('preferred-time').value,
        address: document.getElementById('address').value,
        additionalInfo: document.getElementById('special-instructions')?.value || '',
        serviceType: selectedService2,
        cleaningType: selectedOptions.cleaningType,
        beds: selectedOptions.beds,
        baths: selectedOptions.baths,
        frequency: selectedOptions.frequency,
        recurringFrequency: selectedOptions.recurringFrequency,
        officeSize: selectedOptions.officeSize,
        constructionType: selectedOptions.constructionType,
        squareMeters: selectedOptions.squareMeters,
        totalPrice: calculatePrice()
    };

    openWhatsAppBooking(bookingData);
});

