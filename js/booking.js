//PART 2
    // State management
        let currentTab2 = 0;
        let selectedService2 = '';
        let selectedOptions = {
            cleaningType: '',
            beds: 2,
            baths: 1,
            frequency: 'once-off',
            recurringFrequency: '',
            officeSize: '',
            constructionType: '',
            addons: []
        };

        // Pricing logic
        const pricing = {
            residential: {
                standard: { base: 300, perRoom: 300 },
                deep: { base: 475, perRoom: 475 },
                move: { base: 1400, perRoom: 80 }
            },
            green: {
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
            addons: {
                window: 100,
                carpet: 250,
                appliance: 100,
                garage: 100
            }
        };

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            initializeTabs();
            initializeServiceSelection();
            initializeOptions();
            initializeAddons();
            updatePrice();
        });

        function initializeTabs() {
            const tabItems = document.querySelectorAll('.tab-item');
            tabItems.forEach((tab, index) => {
                tab.addEventListener('click', () => switchTab(index));
            });
        }

        function switchTab(tabIndex) {
            const tabItems = document.querySelectorAll('.tab-item');
            const tabContents = document.querySelectorAll('.tab-content');
            
            // Remove active classes
            tabItems.forEach(item => item.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active classes
            tabItems[tabIndex].classList.add('active');
            tabContents[tabIndex].classList.add('active');
            
            currentTab2 = tabIndex;
            updateContinueButton();
        }

        function nextTab() {
            if (currentTab2 < 3) {
                switchTab(currentTab2 + 1);
            } else {
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
                    showServiceOptions(selectedService2);
                    updatePrice();
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

        function initializeOptions() {
            // Residential cleaning type selection
            const cleaningTypes = document.querySelectorAll('.cleaning-type');
            cleaningTypes.forEach(type => {
                type.addEventListener('click', () => {
                    cleaningTypes.forEach(t => t.classList.remove('selected'));
                    type.classList.add('selected');
                    selectedOptions.cleaningType = type.dataset.cleaning;
                    updatePrice();
                });
            });

            // Construction type selection
            const constructionTypes = document.querySelectorAll('.construction-type');
            constructionTypes.forEach(type => {
                type.addEventListener('click', () => {
                    constructionTypes.forEach(t => t.classList.remove('selected'));
                    type.classList.add('selected');
                    selectedOptions.constructionType = type.dataset.construction;
                    updatePrice();
                });
            });

            // Office type selection
            const officeTypes = document.querySelectorAll('.office-type');
            officeTypes.forEach(type => {
                type.addEventListener('click', () => {
                    officeTypes.forEach(t => t.classList.remove('selected'));
                    type.classList.add('selected');
                    selectedOptions.officeSize = type.dataset.office;
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
                    updatePrice();
                });
            }

            if (bathsSelect) {
                bathsSelect.addEventListener('change', () => {
                    selectedOptions.baths = parseInt(bathsSelect.value);
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

        function initializeAddons() {
            const checkboxItems = document.querySelectorAll('.checkbox-item[data-addon]');
            checkboxItems.forEach(item => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                const addonType = item.dataset.addon;
                
                item.addEventListener('click', (e) => {
                    if (e.target.type !== 'checkbox') {
                        checkbox.checked = !checkbox.checked;
                    }
                    
                    if (checkbox.checked) {
                        item.classList.add('selected');
                        if (!selectedOptions.addons.includes(addonType)) {
                            selectedOptions.addons.push(addonType);
                        }
                    } else {
                        item.classList.remove('selected');
                        selectedOptions.addons = selectedOptions.addons.filter(addon => addon !== addonType);
                    }
                    
                    updatePrice();
                });

                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        item.classList.add('selected');
                        if (!selectedOptions.addons.includes(addonType)) {
                            selectedOptions.addons.push(addonType);
                        }
                    } else {
                        item.classList.remove('selected');
                        selectedOptions.addons = selectedOptions.addons.filter(addon => addon !== addonType);
                    }
                    
                    updatePrice();
                });
            });
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
                            totalPrice = 1400 + (beds - 1) * 80;
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
                totalPrice = 1500; // Base price for post-construction
            } else if (selectedService2 === 'office') {
                totalPrice = 3500; // Base price for office cleaning
            }

            // Add addon prices
            selectedOptions.addons.forEach(addon => {
                totalPrice += pricing.addons[addon] || 0;
            });

            return totalPrice;
        }

        function updatePrice() {
            const price = calculatePrice();
            const priceDisplay = document.getElementById('total-price');
            priceDisplay.textContent = `R${price} ZAR`;
        }

        function updateContinueButton() {
            const continueBtn = document.getElementById('continue-btn');
            
            if (currentTab2 === 0) {
                continueBtn.textContent = 'Continue to Next Step';
                continueBtn.disabled = !selectedService2;
            } else if (currentTab2 === 1) {
                continueBtn.textContent = 'Continue to Add-ons';
                continueBtn.disabled = false;
            } else if (currentTab2 === 2) {
                continueBtn.textContent = 'Continue to Details';
                continueBtn.disabled = false;
            } else if (currentTab2 === 3) {
                continueBtn.textContent = 'Submit Booking';
                
                // Check if required fields are filled
                const fullName = document.getElementById('full-name').value;
                const email = document.getElementById('email').value;
                const phone = document.getElementById('phone').value;
                const preferredDate = document.getElementById('preferred-booking-date').value;
                const preferredTime = document.getElementById('preferred-time').value;
                const address = document.getElementById('address').value;
                
                continueBtn.disabled = !fullName || !email || !phone || !preferredDate || !preferredTime || !address;
            }
        }

        
       
        function submitBooking() {
            // Collect all form data
            const bookingData = {
                service: selectedService2,
                options: selectedOptions,
                addons: selectedOptions.addons,
                totalPrice: calculatePrice(),
                customerInfo: {
                    fullName: document.getElementById('full-name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    bookingType: document.querySelector('input[name="booking-type"]:checked').value,
                    preferredDate: document.getElementById('preferred-booking-date').value,
                    preferredTime: document.getElementById('preferred-time').value,
                    address: document.getElementById('address').value
                },
                assessment: {
                    virtual: document.getElementById('virtual-assessment').checked,
                    onsite: document.getElementById('onsite-assessment').checked,
                    preferredDateTime: document.getElementById('preferred-date').value
                }
            };
            
            console.log('Booking Data:', bookingData);
            alert('Booking submitted successfully! We will contact you soon.');
        }

        // Form validation for the details tab
        document.addEventListener('input', (e) => {
            if (currentTab2 === 3) {
                updateContinueButton();
            }
        });

        document.addEventListener('change', (e) => {
            if (currentTab2 === 3) {
                updateContinueButton();
            }
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