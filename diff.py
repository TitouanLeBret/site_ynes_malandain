from playwright.sync_api import sync_playwright
from PIL import Image
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 6132})
        page.goto(f"file://{os.getcwd()}/index.html")
        page.screenshot(path="shot.png", full_page=True)
        browser.close()

    shot = Image.open("shot.png").convert("RGBA")
    design = Image.open("design.png").convert("RGBA")
    
    # Ensure same size
    if shot.size != design.size:
        shot = shot.resize(design.size)
        
    design.putalpha(128)
    diff = Image.alpha_composite(shot, design)
    diff.save("diff.png")
    print("Visual diff saved to diff.png")
    
if __name__ == "__main__":
    run()
