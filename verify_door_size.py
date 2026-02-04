
import os
from playwright.sync_api import sync_playwright, expect

def verify_door_size():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to app
        page.goto("http://localhost:5173")

        # Expect the upload zone
        expect(page.get_by_text("Glissez une photo ou cliquez pour importer")).to_be_visible()

        # Upload file
        # Use existing asset
        file_input = page.locator('input[type="file"]')
        file_input.set_input_files("src/assets/react.svg")

        # Wait for the "Masquer repères" button which appears when image is loaded
        expect(page.get_by_text("Masquer repères")).to_be_visible()

        # Wait a bit for layout to settle
        page.wait_for_timeout(1000)

        # Take screenshot
        os.makedirs("verification", exist_ok=True)
        screenshot_path = "verification/door_size_verification.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    verify_door_size()
