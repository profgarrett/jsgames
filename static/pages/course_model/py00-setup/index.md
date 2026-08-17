<script src="/course_model/toc.js"></script>

# Setup your computer

We will be using Python for data analysis and modeling in this course. Follow the steps below to install Python and Visual Studio Code (VS Code).

I do not recommend using Anaconda. If it is working, then you can feel free to continue using it. However, many students have issues with package management.

**Outcomes**:
- Install Python
- Install Visual Studio Code (VS Code)
- Disable Copilot 
- Be comfortable moving files around your computer, and creating folders
- Understand file extensions and hidden files

## Python

Open a terminal window (Command Prompt on Windows, Terminal on macOS/Linux) and follow these steps:
- On OSX or Linux, you can <key>Space+Command</key> and type in "terminal" to find it.
- On Windows, you can press <key>Windows+R</key>, type in "cmd", and hit Enter.

Type in the following command:
```bash
python3
```

If you see a message like `Python 3.x.x` followed by some information about your Python installation, then Python is already installed on your system. You can exit the Python interpreter by typing `exit()` and pressing Enter.

If you see an error message indicating that Python is not recognized, you'll need to install it. Or, if your version is older than 3.8, you should install a newer version. 

   - Go to the official Python website: [https://www.python.org/downloads/](https://www.python.org/downloads/)
   - Download the latest version 
   - Run the installer and follow the on-screen instructions. Make sure to check the box that says "Add Python to PATH" during installation.
   - Reboot your computer, then re-open the terminal and type `python3` again to verify the installation.


## Visual Studio Code (VS Code)

VS Code is our editor. It has a lot of excellent features. However, you will need to do some configuration.

- Go to the official VS Code website: [https://code.visualstudio.com/](https://code.visualstudio.com/)
- Download the installer 
- Run the installer.
- After installation, open VS Code.
- Install extensions
   - Click on the Extensions icon in the left sidebar (or press `Ctrl+Shift+X`).
   - Install Microsoft's "Python" plugin
   - Install Microsoft's "Jupyter" plugin
   - Install Microsoft's "Data Wrangler"

We will use the AI features in VS Code. However, for the first few weeks of the class, using it will significantly hamper your learning. As a result, you will need to *log out of the Copilot account*. This will generally stop it from suggesting solutions to our problems.

## File Management

Managing your folders and files is a key skill. When you save a file, it goes into the hard drive on your computer. This hard drive (called the `C:\` on Windows) organizes files into certain locations, called folders.

All modern systems store your files in several folders:

- `Downloads`: this is supposed to be temporary spot for files downloaded by Safari or Chrome.
- `Desktop`: files/folders visible on your desktop
- `Documents`: where you should store your long-term files

One wrinkle is that Windows often uses OneDrive. OneDrive is an online service that syncs your local files with servers in the Internet. Files are typically still stored on your computer, but are regularly uploaded. So, if you have OneDrive turned on, typically the OneDrive Downloads/Desktop/Documents is the same as the location on your hard drive (usually C:\).


Organize your files: [link to video on YouTube](https://www.youtube.com/watch?v=gfPujXtQqwc)

Here is a quick guide for organizing your files, slightly more focused on the Mac. [link to video on YouTube](https://www.youtube.com/watch?v=gfx7G4NQQMg)


### Making folders

You should have a folder for our class. Then, create a folder for each week or major project. Store your files inside of this folder.


#### Make a folder on PC

Right-click in a folder, and choose `New folder` (or press `Control+Shift+N`)

<iframe width='640' height='572' src="https://www.youtube.com/embed/Amd6V-ERLO8" data-external= "1" allowfullscreen> </iframe>
[link to video on YouTube](https://www.youtube.com/watch?v=Amd6V-ERLO8)

#### Make a folder on Mac

Right-click in a folder, and choose `New Folder`

<iframe width='640' height='572' src="https://www.youtube.com/embed/xPVOaFmQ7_s" data-external= "1" allowfullscreen> </iframe>

[link to video on YouTube](https://www.youtube.com/watch?v=xPVOaFmQ7_s)

### Moving files

Avoid modifying any files in your download folder. Instead, download them, and then copy them to the appropriate folder.

#### Move files on a PC

Guide to using Files Explorer on Windows.

<iframe width='640' height='572' src="https://www.youtube.com/embed/hXLpEG3IX-A" data-external= "1" allowfullscreen> </iframe>
[link to video on YouTube](https://www.youtube.com/watch?v=hXLpEG3IX-A)

#### Move files on a Mac

I suggest disabling the Force touch feature:

- Use the Apple menu to open `System Preferences`
- Click `Trackpad`, the `Point & Click` tab
- Turn off `Force click and haptic feedback` 


Right-click on a file, right-click copy, go to the new place, and click paste. 
Or, move a file by opening a separate `Finder` window, and dragging/dropping your files.

<iframe width='640' height='572' src="https://www.youtube.com/embed/gFKJpkpDcwo" data-external= "1" allowfullscreen> </iframe>
[link to video on YouTube](https://www.youtube.com/watch?v=gFKJpkpDcwo)


## Other setup

One more thing that would be helpful in our class is to turn on file extensions. This will tell you the hidden information that lives in ever file's name. So, when you save a Word document as `my stuff`, it actually is saved as `my stuff.docx`. The `.docx` tells the computer to open the file in Word.

As we work with more complex files, you will find that you can not just click on a file to open it in the right program. Instead, get in the habit of opening a program first. Then, inside of the program, open the file (usually by going to the file menu and choosing open).

To turn on:

- Open Windows Explorer
- Open View menu
- Show submenu
- File Name Extensions