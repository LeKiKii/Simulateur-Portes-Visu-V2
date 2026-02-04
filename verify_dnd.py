
import os
from playwright.sync_api import sync_playwright, expect

def verify_dnd():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to app
        page.goto("http://localhost:5173")

        # Expect the upload zone
        expect(page.get_by_text("Glissez une photo ou cliquez pour importer")).to_be_visible()

        # Trigger drop event via JS
        page.evaluate("""
            const dataTransfer = new DataTransfer();
            const file = new File(['(⌐■_■)'], 'cool_bg.png', { type: 'image/png' });
            dataTransfer.items.add(file);

            const event = new DragEvent('drop', {
              bubbles: true,
              cancelable: true,
              dataTransfer: dataTransfer,
            });

            document.querySelector('main').dispatchEvent(event);
        """)

        # Wait for the "Masquer repères" button which appears when image is loaded
        # This confirms the drop handler worked and processed the file
        expect(page.get_by_text("Masquer repères")).to_be_visible()

        print("Drag and drop simulated successfully.")

        browser.close()

if __name__ == "__main__":
    verify_dnd()
