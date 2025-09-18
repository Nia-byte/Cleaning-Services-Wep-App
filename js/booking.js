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
                return true; // Green cleaning doesn't need additional selection beyond beds/baths
            }
            return false;
            
        case 2: // Add-ons tab
            return true; // Add-ons are optional
            
        case 3: // Details tab
            const fullName = document.getElementById('full-name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const phone = document.getElementById('phone')?.value || '';
            const preferredDate = document.getElementById('preferred-booking-date')?.value || '';
            const preferredTime = document.getElementById('preferred-time')?.value || '';
            const address = document.getElementById('address')?.value || '';
            
            return fullName && email && phone && preferredDate && preferredTime && address;
            
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
}


function nextTab() {
    if (currentTab2 < 3 && isCurrentTabComplete()) {
        switchTab(currentTab2 + 1);
    } else if (currentTab2 === 3 && isCurrentTabComplete()) {
        // Submit form
        submitBooking();
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
        } else {
            continueBtn.disabled = false;
        }
    } else if (currentTab2 === 2) {
        continueBtn.textContent = 'Continue to Booking Details';
        
        // Check if required fields are filled for the "Your Information" tab
        const fullName = document.getElementById('full-name')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const phone = document.getElementById('phone')?.value || '';
        
        continueBtn.disabled = !fullName || !email || !phone;
    } else if (currentTab2 === 3) {
        // Tab 3 is the confirmation tab - hide the button initially
        // It will be shown/hidden by the submission process
        continueBtn.style.display = 'none';
    }
}



async function submitBooking() {
    // Show loading state
    const continueBtn = document.getElementById('continue-btn');
    const originalText = continueBtn.textContent;
    continueBtn.textContent = 'Submitting...';
    continueBtn.disabled = true;

    try {
        // Get form field values using the correct selectors
        const fullNameInput = document.getElementById('full-name') || document.querySelector('input[placeholder="Enter your full name"]');
        const emailInput = document.getElementById('email') || document.querySelector('input[placeholder="Enter your email address"]');
        const phoneInput = document.getElementById('phone') || document.querySelector('input[placeholder="Enter your phone number"]');
        const dateInput = document.getElementById('preferred-booking-date') || document.querySelector('input[type="date"]');
        const timeInput = document.getElementById('preferred-time') || document.querySelector('input[type="time"]');
        const addressInput = document.getElementById('address') || document.querySelector('textarea[placeholder="Enter your complete address"]');
        const specialInstructionsInput = document.getElementById('special-instructions') || document.querySelector('textarea[placeholder="Any specific requirements or notes"]');
        const bookingTypeInput = document.querySelector('input[name="booking-type"]:checked');

        // Collect all form data with correct structure
        const bookingData = {
            name: fullNameInput?.value || '',
            email: emailInput?.value || '',
            phone: phoneInput?.value || '',
            date: dateInput?.value || '',
            time: timeInput?.value || '',
            bookingType: bookingTypeInput?.value || '',
            address: addressInput?.value || '',
            additionalInfo: specialInstructionsInput?.value || ''
        };

        // Client-side validation of required fields
        if (!bookingData.name || !bookingData.email || !bookingData.phone || 
            !bookingData.date || !bookingData.time || !bookingData.address) {
            throw new Error('Please fill in all required fields');
        }

        console.log('Sending booking data:', bookingData);

        // Send booking data to Netlify function
        const response = await fetch('/.netlify/functions/send-booking-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Success
            showSuccessMessage();
            console.log('Booking submitted successfully:', result);
            
            // Optionally reset the form or redirect
            // resetForm();
        } else {
            // Error from function
            throw new Error(result.error || 'Failed to submit booking');
        }

    } catch (error) {
        console.error('Error submitting booking:', error);
        showErrorMessage(error.message);
    } finally {
        // Restore button state
        continueBtn.textContent = originalText;
        continueBtn.disabled = false;
    }
}

// Enhanced showSuccessMessage function with service details
function showSuccessMessage() {
    // Get booking details from form
    const fullName = document.getElementById('full-name')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const date = document.getElementById('preferred-booking-date')?.value || '';
    const time = document.getElementById('preferred-time')?.value || '';
    const address = document.getElementById('address')?.value || '';
    const bookingType = document.querySelector('input[name="booking-type"]:checked')?.value || 'Personal';
    const specialInstructions = document.getElementById('special-instructions')?.value || '';

    // Format the date for better display
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Format time for better display
    const formattedTime = new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    // Get service details
    const serviceDetails = getServiceSummary();
    const totalPrice = calculatePrice();

    // Create detailed success message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'booking-message success-message';
    messageDiv.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
            border: 2px solid #28a745;
            color: #155724;
            padding: 25px;
            border-radius: 12px;
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.15);
        ">
            <div style="text-align: center; margin-bottom: 25px;">
                <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                <h2 style="margin: 0; color: #155724; font-size: 24px;">Booking Confirmed!</h2>
                <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.8;">Thank you for choosing NiaImani Group Cleaning Services</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 8px;">
                    <h3 style="margin-top: 0; color: #155724; font-size: 18px; border-bottom: 2px solid #28a745; padding-bottom: 8px;">Service Details</h3>
                    <div style="line-height: 1.6;">
                        <strong>Service Type:</strong> ${serviceDetails.serviceType}<br>
                        ${serviceDetails.details}<br>
                        <strong>Estimated Price:</strong> <span style="font-size: 18px; font-weight: bold; color: #28a745;">R${totalPrice} ZAR</span>
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 8px;">
                    <h3 style="margin-top: 0; color: #155724; font-size: 18px; border-bottom: 2px solid #28a745; padding-bottom: 8px;">Appointment Details</h3>
                    <div style="line-height: 1.6;">
                        <strong>Date:</strong> ${formattedDate}<br>
                        <strong>Time:</strong> ${formattedTime}<br>
                        <strong>Type:</strong> ${bookingType} Booking<br>
                        <strong>Location:</strong> ${address.substring(0, 50)}${address.length > 50 ? '...' : ''}
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #155724; font-size: 18px; border-bottom: 2px solid #28a745; padding-bottom: 8px;">Contact Information</h3>
                <div style="line-height: 1.6;">
                    <strong>Name:</strong> ${fullName}<br>
                    <strong>Email:</strong> ${email}<br>
                    <strong>Phone:</strong> ${phone}
                </div>
            </div>
            
            ${specialInstructions ? `
            <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #155724; font-size: 18px; border-bottom: 2px solid #28a745; padding-bottom: 8px;">Special Instructions</h3>
                <div style="line-height: 1.6; font-style: italic;">
                    "${specialInstructions}"
                </div>
            </div>
            ` : ''}
            
            <div style="text-align: center; padding: 20px; background: rgba(40, 167, 69, 0.1); border-radius: 8px; border: 1px dashed #28a745;">
                <h3 style="margin-top: 0; color: #155724;">What happens next?</h3>
                <p style="margin: 10px 0; line-height: 1.6;">
                    📧 <strong>Confirmation email sent</strong> - Check your inbox<br>
                    📞 <strong>We'll call you within 24 hours</strong> to confirm details<br>
                    📋 <strong>Final quote will be provided</strong> after consultation<br>
                    🧽 <strong>Enjoy your sparkling clean space!</strong>
                </p>
                
                <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.8); border-radius: 6px;">
                    <p style="margin: 0; font-size: 14px; color: #666;">
                        <strong>Need to make changes?</strong> Contact us at <a href="mailto:info@niaimanigroup.co.za" style="color: #28a745;">info@niaimanigroup.co.za</a>
                    </p>
                </div>
            </div>
        </div>
    `;
    
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.booking-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Insert the message at the top of the current tab content
    const activeTabContent = document.querySelector('.tab-content.active');
    if (activeTabContent) {
        activeTabContent.insertBefore(messageDiv, activeTabContent.firstChild);
        
        // Scroll to top to show the message
        activeTabContent.scrollTop = 0;
        
        // Also scroll the main container to top
        const mainContainer = document.querySelector('.right-section');
        if (mainContainer) {
            mainContainer.scrollTop = 0;
        }
    }
    
    // Hide the continue button after successful submission
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.style.display = 'none';
    }
    
    // Optionally hide the form fields to focus attention on the success message
    const formGroups = document.querySelectorAll('#tab-4 .form-group');
    formGroups.forEach(group => {
        group.style.opacity = '0.6';
        group.style.pointerEvents = 'none';
    });
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


function showErrorMessage(errorMessage) {
    // Create and show error message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'booking-message error-message';
    messageDiv.innerHTML = `
        <div style="
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
        ">
            <h3>Booking Submission Failed</h3>
            <p>We're sorry, but there was an error submitting your booking: ${errorMessage}</p>
            <p>Please try again or contact us directly at info@niaimanigroup.co.za</p>
        </div>
    `;
    
    // Insert the message at the top of the form
    const contentArea = document.querySelector('.content-area');
    contentArea.insertBefore(messageDiv, contentArea.firstChild);
    
    // Scroll to top to show the message
    contentArea.scrollTop = 0;
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