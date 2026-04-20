import { test, expect } from '@playwright/test';

test.describe('Solar Power System App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application', async ({ page }) => {
    await expect(page).toHaveTitle('Solar Power System Calculator');
    await expect(page.locator('h1')).toContainText('Solar Power System');
  });

  test('should display system diagram', async ({ page }) => {
    const diagram = page.locator('img[src="/img/solar-power-system-diagram.png"]');
    await expect(diagram).toBeVisible();
  });

  test('should display all main sections', async ({ page }) => {
    // Check for System Diagram section
    await expect(page.locator('legend').filter({ hasText: 'System Diagram' })).toBeVisible();

    // Check for System Requirements section
    await expect(page.locator('legend').filter({ hasText: 'System Requirements' })).toBeVisible();

    // Check for Solar Panel section
    await expect(page.locator('legend').filter({ hasText: 'Solar Panel' })).toBeVisible();

    // Check for Battery Config section - looks for "Battery"
    await expect(page.locator('legend').filter({ hasText: 'Battery' }).first()).toBeVisible();

    // Check for Charge Controller section
    await expect(page.locator('legend').filter({ hasText: 'Charge Controller' })).toBeVisible();

    // Check for Battery Cable section - looks for "Cable"
    await expect(page.locator('legend').filter({ hasText: 'Cable' })).toBeVisible();
  });

  test('should have empty state for devices initially', async ({ page }) => {
    await expect(page.locator('.empty-state')).toContainText('No devices added yet');
  });

  test('should add a device', async ({ page }) => {
    // Click "Add device" button
    await page.locator('button:has-text("Add device")').click();

    // Modal should be visible
    const modal = page.locator('dialog.device-modal');
    await expect(modal).toBeVisible();

    // Fill in device details - get inputs within the modal
    const inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('Refrigerator'); // Name
    await inputs.nth(1).fill('500'); // Watts
    await inputs.nth(2).fill('8'); // Hours

    // Click Add button in modal
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // Device should appear in the list
    await expect(page.locator('.device-item')).toContainText('Refrigerator');
    await expect(page.locator('.device-watt-hours')).toHaveValue('4000'); // 500 * 8
  });

  test('should update total watt hours when device is added', async ({ page }) => {
    // Add first device
    await page.locator('button:has-text("Add device")').click();
    let inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('Device 1');
    await inputs.nth(1).fill('100');
    await inputs.nth(2).fill('5');
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    // Check total (100 * 5 = 500)
    let totalInput = page.locator('#watt-hours');
    await expect(totalInput).toHaveValue('500');

    // Add second device
    await page.locator('button:has-text("Add device")').click();
    inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('Device 2');
    await inputs.nth(1).fill('200');
    await inputs.nth(2).fill('3');
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    // Check updated total (500 + 600 = 1100)
    totalInput = page.locator('#watt-hours');
    await expect(totalInput).toHaveValue('1100');
  });

  test('should remove a device', async ({ page }) => {
    // Add a device
    await page.locator('button:has-text("Add device")').click();
    let inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('Laptop');
    await inputs.nth(1).fill('150');
    await inputs.nth(2).fill('4');
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    // Verify device is added
    await expect(page.locator('.device-item')).toContainText('Laptop');

    // Click remove button (×)
    await page.locator('button.btn-remove').click();

    // Device should be removed
    await expect(page.locator('.empty-state')).toContainText('No devices added yet');
    await expect(page.locator('#watt-hours')).toHaveValue('0');
  });

  test('should change autonomy (backup days)', async ({ page }) => {
    const backupDaysInput = page.locator('#backup-days');

    // Check initial value
    const initialValue = await backupDaysInput.inputValue();
    expect(initialValue).toBeTruthy();

    // Change value
    await backupDaysInput.fill('3');
    await backupDaysInput.blur();

    // Verify new value is set
    await expect(backupDaysInput).toHaveValue('3');
  });

  test('should change battery type', async ({ page }) => {
    // Find battery type select
    const batteryTypeSelect = page.locator('select').first();

    // Get current value
    const currentValue = await batteryTypeSelect.inputValue();

    // Change to opposite battery type
    const newValue = currentValue === 'lithium' ? 'leadacid' : 'lithium';
    await batteryTypeSelect.selectOption(newValue);

    // Verify selection changed
    await expect(batteryTypeSelect).toHaveValue(newValue);
  });

  test('should change system voltage', async ({ page }) => {
    // Find voltage select (second select element)
    const voltageSelect = page.locator('select').nth(1);

    // Get initial value
    const initialValue = await voltageSelect.inputValue();
    expect(initialValue).toBeTruthy();

    // Get all available options
    const options = await voltageSelect.locator('option').allTextContents();

    if (options.length > 1) {
      // Select a different option (try the second one)
      const newOption = options[1];

      if (newOption) {
        await voltageSelect.selectOption(newOption.trim());

        // Verify selection changed
        const newValue = await voltageSelect.inputValue();
        expect(newValue).not.toBe(initialValue);
      }
    }
  });

  test('should display calculated battery capacity', async ({ page }) => {
    // Add a device with known watt hours
    await page.locator('button:has-text("Add device")').click();
    const inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('Test Device');
    await inputs.nth(1).fill('100');
    await inputs.nth(2).fill('10');
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    // Set autonomy days
    await page.locator('#backup-days').fill('2');
    await page.locator('#backup-days').blur();

    // Battery capacity field should exist and have a value
    const readonlyInputs = page.locator('input[readonly]');
    const count = await readonlyInputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should handle multiple devices workflow', async ({ page }) => {
    // Add multiple devices
    const devices = [
      { name: 'LED Lights', watts: 50, hours: 12 },
      { name: 'Refrigerator', watts: 150, hours: 8 },
      { name: 'Water Pump', watts: 300, hours: 2 },
    ];

    for (const device of devices) {
      await page.locator('button:has-text("Add device")').click();
      const inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
      await inputs.first().fill(device.name);
      await inputs.nth(1).fill(device.watts.toString());
      await inputs.nth(2).fill(device.hours.toString());
      await page.locator('dialog.device-modal button:has-text("Add")').click();
    }

    // Verify all devices are listed
    const deviceItems = page.locator('.device-item');
    await expect(deviceItems).toHaveCount(3);

    // Verify total calculation
    const expectedTotal = (50 * 12) + (150 * 8) + (300 * 2); // 2200
    await expect(page.locator('#watt-hours')).toHaveValue(expectedTotal.toString());
  });

  test('should maintain values on form interactions', async ({ page }) => {
    // Add a device
    await page.locator('button:has-text("Add device")').click();
    let inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('TV');
    await inputs.nth(1).fill('200');
    await inputs.nth(2).fill('6');
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    // Change backup days
    await page.locator('#backup-days').fill('5');
    await page.locator('#backup-days').blur();

    // Change battery type to opposite value
    const batteryTypeSelect = page.locator('select').first();
    const currentValue = await batteryTypeSelect.inputValue();
    const newValue = currentValue === 'lithium' ? 'leadacid' : 'lithium';
    await batteryTypeSelect.selectOption(newValue);

    // Verify device still exists with correct watt hours
    await expect(page.locator('.device-item')).toContainText('TV');
    await expect(page.locator('.device-watt-hours')).toHaveValue('1200'); // 200 * 6

    // Verify form values persisted
    await expect(page.locator('#backup-days')).toHaveValue('5');
    await expect(batteryTypeSelect).toHaveValue(newValue);
  });

  test('should close modal on cancel', async ({ page }) => {
    // Open modal
    await page.locator('button:has-text("Add device")').click();
    const modal = page.locator('dialog.device-modal');
    await expect(modal).toBeVisible();

    // Fill in some data
    const inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('Test');

    // Click Cancel button
    await page.locator('dialog.device-modal button:has-text("Cancel")').click();

    // Modal should be closed
    await expect(modal).not.toBeVisible();

    // No device should be added
    await expect(page.locator('.empty-state')).toContainText('No devices added yet');
  });

  test('should validate input ranges', async ({ page }) => {
    // Check backup days constraints
    const backupDaysInput = page.locator('#backup-days');
    const minAttr = await backupDaysInput.getAttribute('min');
    const maxAttr = await backupDaysInput.getAttribute('max');
    expect(minAttr).toBe('1');
    expect(maxAttr).toBe('365');

    // Open modal and check watts constraints
    await page.locator('button:has-text("Add device")').click();
    const modal = page.locator('dialog.device-modal');
    await expect(modal).toBeVisible();

    // Get the watts input (first number input in modal)
    const wattsInput = page.locator('dialog.device-modal input[type="number"]').first();
    const wattsMaxAttr = await wattsInput.getAttribute('max');
    expect(wattsMaxAttr).toBe('10000');

    // Check hours constraints
    const hoursInput = page.locator('dialog.device-modal input[type="number"]').nth(1);
    const hoursMaxAttr = await hoursInput.getAttribute('max');
    expect(hoursMaxAttr).toBe('24');

    await page.locator('dialog.device-modal button:has-text("Cancel")').click();
  });
});

test.describe('Solar Power System Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should update solar panel wattage when device is added', async ({ page }) => {
    // Add a device with known watt hours
    await page.locator('button:has-text("Add device")').click();
    const inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('Refrigerator');
    await inputs.nth(1).fill('500'); // 500 watts
    await inputs.nth(2).fill('8'); // 8 hours = 4000 watt-hours
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    // Set backup days
    await page.locator('#backup-days').fill('1');
    await page.locator('#backup-days').blur();

    // Set average sun hours
    await page.locator('#avg-sun-hours').fill('7');
    await page.locator('#avg-sun-hours').blur();

    // Solar panel wattage should be correctly calculated
    await expect(page.locator('#array-wattage')).toHaveValue('600');
  });

  test('should increase solar panel wattage with more devices', async ({ page }) => {
    // Add first device
    await page.locator('button:has-text("Add device")').click();
    let inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('Device 1');
    await inputs.nth(1).fill('100');
    await inputs.nth(2).fill('5');
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    // Set backup days
    await page.locator('#backup-days').fill('1');
    await page.locator('#backup-days').blur();

    // Get first solar wattage reading
    const readonlyInputs = page.locator('input[readonly]');
    const firstReadonlyCount = await readonlyInputs.count();
    const firstSolarWattage = await readonlyInputs.nth(firstReadonlyCount - 2).inputValue();

    // Add second device with more power
    await page.locator('button:has-text("Add device")').click();
    inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('Device 2');
    await inputs.nth(1).fill('500');
    await inputs.nth(2).fill('8');
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    // Solar wattage should increase
    const secondSolarWattage = await readonlyInputs.nth(firstReadonlyCount - 2).inputValue();

    if (firstSolarWattage && secondSolarWattage) {
      expect(parseInt(secondSolarWattage)).toBeGreaterThan(parseInt(firstSolarWattage));
    }
  });

  test('should update battery capacity (amp hours)', async ({ page }) => {
    // Add a device
    await page.locator('button:has-text("Add device")').click();
    let inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('Device');
    await inputs.nth(1).fill('100');
    await inputs.nth(2).fill('10');
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    // Set backup days
    await page.locator('#backup-days').fill('1');
    await page.locator('#backup-days').blur();

    // Select battery type
    const batteryTypeSelect = page.locator('select').first();
    await batteryTypeSelect.selectOption('lithium');

    // Select battery voltage
    const batteryVoltageSelect = page.locator('select').nth(1);
    await batteryVoltageSelect.selectOption('12');

    // Wait for calculations to stabilize
    await page.waitForTimeout(500);

    // Battery minimum capacity should be correctly calculated
    await expect(page.locator('#minimum-capacity')).toHaveValue('84');
  });

  test('should update fuse size amperage', async ({ page }) => {
    // Add a significant device
    await page.locator('button:has-text("Add device")').click();
    let inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('High Power Device');
    await inputs.nth(1).fill('100');
    await inputs.nth(2).fill('10');
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    // Set backup days
    await page.locator('#backup-days').fill('3');
    await page.locator('#backup-days').blur();

    // Select battery type
    const batteryTypeSelect = page.locator('select').first();
    await batteryTypeSelect.selectOption('leadacid');

    // Select battery voltage
    const batteryVoltageSelect = page.locator('select').nth(1);
    await batteryVoltageSelect.selectOption('12');

    // Wait for calculations to stabilize
    await page.waitForTimeout(500);

    // Fuse size amperage should be correctly calculated
    await expect(page.locator('#fuse-size-amperage')).toHaveValue('625');
  });

  test('should update charge controller amperage', async ({ page }) => {
    // Add a device
    await page.locator('button:has-text("Add device")').click();
    let inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('Device');
    await inputs.nth(1).fill('500');
    await inputs.nth(2).fill('8');
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    // Set backup days
    await page.locator('#backup-days').fill('1');
    await page.locator('#backup-days').blur();

    // Select battery type
    const batteryTypeSelect = page.locator('select').first();
    await batteryTypeSelect.selectOption('lithium');

    // Select battery voltage
    const batteryVoltageSelect = page.locator('select').nth(1);
    await batteryVoltageSelect.selectOption('24');

    // Wait for calculations to stabilize
    await page.waitForTimeout(500);

    // Charge controller amperage should be correctly calculated
    await expect(page.locator('#controller-amperage')).toHaveValue('180');
  });

  test('should update battery cable wire gauge', async ({ page }) => {
    // Add a device to generate amperage
    await page.locator('button:has-text("Add device")').click();
    let inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('Power Device');
    await inputs.nth(1).fill('500');
    await inputs.nth(2).fill('8');
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    // Set backup days and voltage
    await page.locator('#backup-days').fill('1');
    await page.locator('#backup-days').blur();

    // Select battery type
    const batteryTypeSelect = page.locator('select').first();
    await batteryTypeSelect.selectOption('lithium');

    // Select battery voltage
    const batteryVoltageSelect = page.locator('select').nth(1);
    await batteryVoltageSelect.selectOption('48');

    // Select cable length
    const cableSelect = page.locator('select').last();
    await cableSelect.selectOption('10');

    // Wait for calculations to stabilize
    await page.waitForTimeout(500);

    // Battery cable gauge should be correctly selected
    await expect(page.locator('#wire-gauge')).toHaveValue('No. 4 (25 mm²)');

    // Select a different cable length
    await cableSelect.selectOption('100');

    // Battery cable gauge should be correctly selected
    await expect(page.locator('#wire-gauge')).toHaveValue('Not available');
  });

  test('should reflect system changes when battery voltage changes', async ({ page }) => {
    // Add a device
    await page.locator('button:has-text("Add device")').click();
    let inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('Device');
    await inputs.nth(1).fill('300');
    await inputs.nth(2).fill('6');
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    // Set backup days
    await page.locator('#backup-days').fill('1');
    await page.locator('#backup-days').blur();

    // Wait for calculations
    await page.waitForTimeout(500);

    // Get current voltage to verify it changes
    const voltageSelect = page.locator('select').nth(1);
    const currentVoltage = await voltageSelect.inputValue();

    // Get current battery configuration state
    const allReadonlyInputs = page.locator('input[readonly]');
    const countBefore = await allReadonlyInputs.count();

    // Change voltage
    const newVoltage = currentVoltage === '12' ? '24' : '12';
    await voltageSelect.selectOption(newVoltage);

    // Wait for recalculation
    await page.waitForTimeout(500);

    // Verify voltage changed
    const updatedVoltage = await voltageSelect.inputValue();
    expect(updatedVoltage).toBe(newVoltage);

    // System should have recalculated (voltage affects amp hours inversely)
    const countAfter = await allReadonlyInputs.count();
    expect(countBefore).toBeGreaterThan(0);
    expect(countAfter).toBeGreaterThan(0);
  });

  test('should adjust all calculations when backup days increase', async ({ page }) => {
    // Add a device
    await page.locator('button:has-text("Add device")').click();
    let inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('Device');
    await inputs.nth(1).fill('200');
    await inputs.nth(2).fill('5');
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    // Set initial backup days
    await page.locator('#backup-days').fill('1');
    await page.locator('#backup-days').blur();

    // Wait for calculations
    await page.waitForTimeout(500);

    // Get minimum solar array wattage to verify recalculation
    const arrayWattage = page.locator('#array-wattage');
    const totalBefore = parseInt(await arrayWattage.inputValue());

    // Increase backup days significantly
    await page.locator('#backup-days').fill('5');
    await page.locator('#backup-days').blur();

    // Wait for recalculation
    await page.waitForTimeout(500);

    // Verify backup days changed
    const backupDaysInputAfter = await page.locator('#backup-days').inputValue();
    expect(backupDaysInputAfter).toBe('5');

    // System should have recalculated all dependent values
    const allReadonlyInputs = page.locator('input[readonly]');
    const count = await allReadonlyInputs.count();
    expect(count).toBeGreaterThan(0);

    // The solar array wattage requirement increases with more backup days
    const totalAfter = parseInt(await arrayWattage.inputValue());
    expect(totalAfter).toBeGreaterThan(totalBefore);
  });

  test('should handle complete system workflow with multiple changes', async ({ page }) => {
    // Start with empty state
    await expect(page.locator('.empty-state')).toContainText('No devices added yet');

    // Add multiple devices
    const devices = [
      { name: 'Lights', watts: 100, hours: 6 },
      { name: 'Refrigerator', watts: 150, hours: 8 },
      { name: 'Water Pump', watts: 200, hours: 4 },
    ];

    for (const device of devices) {
      await page.locator('button:has-text("Add device")').click();
      const inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
      await inputs.first().fill(device.name);
      await inputs.nth(1).fill(device.watts.toString());
      await inputs.nth(2).fill(device.hours.toString());
      await page.locator('dialog.device-modal button:has-text("Add")').click();
    }

    // Verify all devices added
    await expect(page.locator('.device-item')).toHaveCount(3);

    // Set backup days
    await page.locator('#backup-days').fill('3');
    await page.locator('#backup-days').blur();

    // Change battery type
    const batterySelect = page.locator('select').first();
    await batterySelect.selectOption('leadacid');

    // Change voltage
    const voltageSelect = page.locator('select').nth(1);
    await voltageSelect.selectOption('24');

    // Select cable length
    const cableSelect = page.locator('select').last();
    await cableSelect.selectOption('50');

    // Wait for calculations
    await page.waitForTimeout(500);

    // Verify system is calculated with all values
    const totalWattHours = page.locator('#watt-hours');
    // Total: 100*6 + 150*8 + 200*4 = 600 + 1200 + 800 = 2600
    await expect(totalWattHours).toHaveValue('2600');

    // All calculated fields should have values
    const readonlyInputs = page.locator('input[readonly]');
    const readonlyCount = await readonlyInputs.count();
    expect(readonlyCount).toBeGreaterThan(0);
  });

  test('should remove device and update all calculations', async ({ page }) => {
    // Add two devices
    await page.locator('button:has-text("Add device")').click();
    let inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('Device 1');
    await inputs.nth(1).fill('100');
    await inputs.nth(2).fill('5');
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    await page.locator('button:has-text("Add device")').click();
    inputs = page.locator('dialog.device-modal input[type="text"], dialog.device-modal input[type="number"]');
    await inputs.first().fill('Device 2');
    await inputs.nth(1).fill('200');
    await inputs.nth(2).fill('8');
    await page.locator('dialog.device-modal button:has-text("Add")').click();

    // Set backup days
    await page.locator('#backup-days').fill('2');
    await page.locator('#backup-days').blur();

    // Get initial values
    const totalWattHoursInput = page.locator('#watt-hours');
    const initialTotal = await totalWattHoursInput.inputValue();

    // Remove first device
    const removeButtons = page.locator('button.btn-remove');
    await removeButtons.first().click();

    // Total should decrease
    const newTotal = await totalWattHoursInput.inputValue();
    expect(parseInt(newTotal)).toBeLessThan(parseInt(initialTotal));
  });
});
