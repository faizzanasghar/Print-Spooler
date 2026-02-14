#define _CRT_SECURE_NO_WARNINGS
#include <iostream>
#include <fstream>
#include <string>
#include <thread>
#include <chrono>
#include <cstdlib>
#include <vector>
#include <conio.h>
#include <windows.h>
#include <iomanip>
#include <algorithm>

using namespace std;

// ==========================================
//              CONFIGURATION
// ==========================================
#define MAX 200
#define HASH_SIZE 101
#define PRINTERS 5
#define JOB_FILE "jobs.txt"
#define USER_FILE "users.txt"

enum ThemeType { MODERN, CLASSIC, DARK, LIGHT };

struct Theme {
    string primary, secondary, success, error, warning, info, text, border, bg;
    string boxSingle, boxDouble;
};

class UI {
private:
    static Theme currentTheme;
    static HANDLE hConsole;

public:
    static void init() {
        hConsole = GetStdHandle(STD_OUTPUT_HANDLE);
        setTheme(MODERN);
    }

    static void setTheme(ThemeType type) {
        switch (type) {
        case MODERN:
            currentTheme = { "\033[1;36m", "\033[1;35m", "\033[1;32m", "\033[1;31m", "\033[1;33m", "\033[1;34m", "\033[1;37m", "\033[0;36m", "\033[40m", "+-+|", "#=#|" };
            break;
        case CLASSIC:
            currentTheme = { "\033[0;32m", "\033[1;32m", "\033[1;32m", "\033[1;31m", "\033[1;33m", "\033[1;32m", "\033[0;32m", "\033[0;32m", "\033[40m", "+-+|", "+-+|" };
            break;
        case LIGHT:
            currentTheme = { "\033[1;34m", "\033[1;35m", "\033[1;32m", "\033[1;31m", "\033[1;33m", "\033[1;36m", "\033[1;30m", "\033[0;34m", "\033[47m", "+-+|", "#=#|" };
            break;
        default:
            currentTheme = { "\033[1;36m", "\033[1;35m", "\033[1;32m", "\033[1;31m", "\033[1;33m", "\033[1;34m", "\033[1;37m", "\033[0;37m", "\033[40m", "+-+|", "#=#|" };
        }
    }

    static string primary() { return currentTheme.primary; }
    static string secondary() { return currentTheme.secondary; }
    static string success() { return currentTheme.success; }
    static string error() { return currentTheme.error; }
    static string warning() { return currentTheme.warning; }
    static string info() { return currentTheme.info; }
    static string text() { return currentTheme.text; }
    static string border() { return currentTheme.border; }
    static string bg() { return currentTheme.bg; }
    static string reset() { return "\033[0m"; }

    static void clear() { system("cls"); }

    static void gotoxy(int x, int y) {
        COORD coord;
        coord.X = x;
        coord.Y = y;
        SetConsoleCursorPosition(hConsole, coord);
    }

    static int getWidth() {
        CONSOLE_SCREEN_BUFFER_INFO csbi;
        GetConsoleScreenBufferInfo(hConsole, &csbi);
        return csbi.srWindow.Right - csbi.srWindow.Left + 1;
    }

    static void centerText(string txt, int yOffset = 0) {
        int width = getWidth();
        int len = txt.length();
        int pos = (width - len) / 2;
        if (pos < 0) pos = 0;
        if (yOffset > 0) gotoxy(pos, yOffset);
        else { for (int i = 0; i < pos; i++) cout << " "; }
        cout << txt << endl;
    }

    static void drawLine(int width = 0) {
        if (width == 0) width = getWidth();
        cout << border();
        for (int i = 0; i < width; i++) cout << "-";
        cout << reset() << endl;
    }

    static void drawHeader(string title) {
        clear();
        cout << border();
        for (int i = 0; i < getWidth(); i++) cout << "=";
        cout << endl;
        string centeredTitle = "  " + title + "  ";
        int padLeft = (getWidth() - centeredTitle.length()) / 2;
        cout << border();
        for (int i = 0; i < padLeft; i++) cout << " ";
        cout << primary() << centeredTitle;
        for (int i = 0; i < padLeft; i++) cout << " ";
        cout << endl;
        cout << border();
        for (int i = 0; i < getWidth(); i++) cout << "=";
        cout << reset() << endl << endl;
    }

    static void drawProgressBar(int percent, int width = 40) {
        cout << text() << "[";
        int pos = width * percent / 100;
        for (int i = 0; i < width; ++i) {
            if (i < pos) cout << success() << "#";
            else if (i == pos) cout << success() << ">";
            else cout << text() << ".";
        }
        cout << text() << "] " << (percent < 100 ? warning() : success()) << percent << "%" << reset();
    }

    static string input(string label) {
        string val;
        cout << "  " << warning() << ">> " << text() << label << ": " << reset();
        cin.clear();
        fflush(stdin);
        getline(cin, val);
        return val;
    }

    static void pause() {
        cout << "\n  " << info() << "Press any key to continue..." << reset();
        _getch();
    }
};

Theme UI::currentTheme;
HANDLE UI::hConsole;

// ==========================================
//          CORE DATA STRUCTURES
// ==========================================

struct PrintJob {
    string jobID, type, status, reason;
    int priority;
    int timeRemaining;
    string timestamp;

    PrintJob(string id = "", string t = "", int prio = 0) {
        jobID = id; type = t; priority = prio;
        status = "Queued"; reason = "None";
        if (type == "PDF") timeRemaining = 5 + (rand() % 10);
        else if (type == "IMG") timeRemaining = 8 + (rand() % 15);
        else timeRemaining = 2 + (rand() % 5);

        time_t now = time(0);
        tm* ltm = localtime(&now);
        char buffer[20];
        strftime(buffer, 20, "%H:%M:%S", ltm);
        timestamp = string(buffer);
    }

    string getTypeIcon() const {
        if (type == "PDF") return "[PDF]";
        if (type == "IMG") return "[IMG]";
        if (type == "TXT") return "[TXT]";
        return "[DOC]";
    }

    string getPriorityColor() const {
        if (priority == 1) return UI::error();
        if (priority <= 3) return UI::warning();
        return UI::success();
    }

    void displayRow() const {
        cout << "  " << UI::text() << left << setw(8) << jobID
            << getTypeIcon() << " " << setw(5) << type
            << getPriorityColor() << setw(5) << priority << UI::reset()
            << "   " << setw(10) << timestamp;

        if (status == "Delayed")
            cout << UI::error() << setw(10) << status << UI::reset() << " (" << reason << ")";
        else if (status == "Printing")
            cout << UI::success() << setw(10) << status << UI::reset();
        else
            cout << UI::info() << setw(10) << status << UI::reset();
        cout << endl;
    }
};

struct HashNode {
    string jobID;
    int heapIndex;
    HashNode* next;
    HashNode(string id, int idx) : jobID(id), heapIndex(idx), next(nullptr) {}
};

class HashTable {
private:
    HashNode* table[HASH_SIZE];
    int hashFunction(const string& jobID) {
        int sum = 0;
        for (char c : jobID) sum += c;
        return sum % HASH_SIZE;
    }
public:
    HashTable() { for (int i = 0; i < HASH_SIZE; i++) table[i] = nullptr; }

    void insert(string jobID, int heapIndex) {
        int key = hashFunction(jobID);
        HashNode* newNode = new HashNode(jobID, heapIndex);
        newNode->next = table[key];
        table[key] = newNode;
    }

    HashNode* find(string jobID) {
        int key = hashFunction(jobID);
        HashNode* cur = table[key];
        while (cur) {
            if (cur->jobID == jobID) return cur;
            cur = cur->next;
        }
        return nullptr;
    }

    void update(string jobID, int newIndex) {
        HashNode* node = find(jobID);
        if (node) node->heapIndex = newIndex;
    }

    void remove(string jobID) {
        int key = hashFunction(jobID);
        HashNode* cur = table[key];
        HashNode* prev = nullptr;
        while (cur) {
            if (cur->jobID == jobID) {
                if (prev) prev->next = cur->next;
                else table[key] = cur->next;
                delete cur;
                return;
            }
            prev = cur;
            cur = cur->next;
        }
    }
};

// ==========================================
//           INTERACTIVE INPUT SYSTEM
// ==========================================
class Input {
public:
    static int getArrowKey() {
        int ch = _getch();
        if (ch == 0 || ch == 224) {
            return _getch(); // Return the second code
        }
        return ch;
    }

    static bool confirm(string question) {
        cout << "\n  " << UI::warning() << question << " (y/n): " << UI::reset();
        char ch = _getch();
        return (ch == 'y' || ch == 'Y');
    }
};

class Menu {
private:
    vector<string> options;
    string title;

public:
    Menu(string t, vector<string> opts) : title(t), options(opts) {}

    int show() {
        int selected = 0;
        while (true) {
            UI::drawHeader(title);

            for (size_t i = 0; i < options.size(); i++) {
                if (i == selected) {
                    cout << "    " << UI::primary() << ">> " << UI::bg() << UI::text() << " " << options[i] << " " << UI::reset() << endl;
                }
                else {
                    cout << "       " << UI::text() << options[i] << UI::reset() << endl;
                }
            }

            cout << "\n  " << UI::info() << "[UP/DOWN] Navigate   [Enter] Select" << UI::reset();

            int key = Input::getArrowKey();
            if (key == 72) { // UP
                selected--;
                if (selected < 0) selected = options.size() - 1;
            }
            else if (key == 80) { // DOWN
                selected++;
                if (selected >= options.size()) selected = 0;
            }
            else if (key == 13) { // ENTER
                return selected + 1; // 1-based index
            }
        }
    }
};

class MinHeap {
private:
    PrintJob* heap[MAX];
    int size;
    int nextID;
    HashTable map;

    string generateJobID(const string& type) {
        string code = "";
        for (size_t i = 0; i < 3 && i < type.length(); i++) code += toupper(type[i]);
        code += to_string(nextID++);
        return code;
    }

    void swapJobs(int i, int j) {
        PrintJob* temp = heap[i];
        heap[i] = heap[j];
        heap[j] = temp;
        map.update(heap[i]->jobID, i);
        map.update(heap[j]->jobID, j);
    }

    void siftUp(int index) {
        while (index > 0) {
            int parent = (index - 1) / 2;
            if (heap[index]->priority < heap[parent]->priority) {
                swapJobs(index, parent);
                index = parent;
            }
            else break;
        }
    }

    void siftDown(int index) {
        while (true) {
            int left = 2 * index + 1;
            int right = 2 * index + 2;
            int smallest = index;
            if (left < size && heap[left]->priority < heap[smallest]->priority) smallest = left;
            if (right < size && heap[right]->priority < heap[smallest]->priority) smallest = right;
            if (smallest != index) {
                swapJobs(index, smallest);
                index = smallest;
            }
            else break;
        }
    }

public:
    MinHeap() { size = 0; nextID = 1; loadFromFile(); }
    ~MinHeap() { saveToFile(); }

    int getJobCount() { return size; }
    int getDelayedCount() {
        int count = 0;
        for (int i = 0; i < size; i++) if (heap[i]->status == "Delayed") count++;
        return count;
    }

    void addJob() {
        Menu typeMenu("SELECT DOCUMENT TYPE", { "PDF Document", "Image File", "Text File", "Other" });
        int typeChoice = typeMenu.show();
        string type = (typeChoice == 1) ? "PDF" : (typeChoice == 2) ? "IMG" : (typeChoice == 3) ? "TXT" : "DOC";

        UI::drawHeader("SET PRIORITY");
        cout << "\n  " << UI::info() << "1 = Critical, 5 = Low" << UI::reset() << endl;
        string pStr = UI::input("Priority (1-5)");
        int prio = atoi(pStr.c_str());
        if (prio < 1 || prio > 5) prio = 5;

        string id = generateJobID(type);
        PrintJob* job = new PrintJob(id, type, prio);
        heap[size] = job;
        map.insert(id, size);
        siftUp(size++);

        cout << "\n  " << UI::success() << "[OK] Job Created! ID: " << id << UI::reset() << endl;
        UI::pause();
    }

    void cancelJob() {
        UI::drawHeader("CANCEL JOB");
        string id = UI::input("Enter Job ID to Cancel");
        HashNode* node = map.find(id);

        if (!node) {
            cout << "\n  " << UI::error() << "[X] Job not found!" << UI::reset() << endl;
        }
        else {
            if (Input::confirm("Are you sure you want to delete " + id + "?")) {
                int idx = node->heapIndex;
                swapJobs(idx, size - 1);
                map.remove(heap[size - 1]->jobID);
                delete heap[size - 1];
                size--;
                if (idx < size) { siftUp(idx); siftDown(idx); }
                cout << "\n  " << UI::success() << "[OK] Job " << id << " removed." << UI::reset() << endl;
            }
        }
        UI::pause();
    }

    void updateJob() {
        UI::drawHeader("UPDATE JOB STATUS");
        string id = UI::input("Enter Job ID");
        HashNode* node = map.find(id);

        if (!node) {
            cout << "\n  " << UI::error() << "[X] Job not found!" << UI::reset() << endl;
            UI::pause();
            return;
        }

        PrintJob* job = heap[node->heapIndex];
        Menu updateMenu("UPDATE OPTIONS", { "Update Priority", "Set Status (Delay/Queue)" });
        int choice = updateMenu.show();

        if (choice == 1) {
            string pStr = UI::input("New Priority (1-5)");
            job->priority = stoi(pStr);
            siftUp(node->heapIndex);
            siftDown(node->heapIndex);
            cout << "\n  " << UI::success() << "[OK] Priority Updated." << UI::reset() << endl;
        }
        else if (choice == 2) {
            Menu statusMenu("SELECT STATUS", { "Queued", "Delayed" });
            int st = statusMenu.show();
            if (st == 2) {
                job->status = "Delayed";
                job->reason = UI::input("Reason for Delay");
            }
            else {
                job->status = "Queued";
                job->reason = "";
            }
            cout << "\n  " << UI::success() << "[OK] Status Updated." << UI::reset() << endl;
        }
        UI::pause();
    }

    void listJobs() {
        UI::drawHeader("CURRENT JOB QUEUE");
        if (size == 0) {
            cout << "\n  " << UI::warning() << "[ Empty Queue ]" << UI::reset() << endl;
        }
        else {
            cout << UI::border() << "  ID        Type   Prio    Status       Timestamp" << UI::reset() << endl;
            UI::drawLine();
            for (int i = 0; i < size; i++) {
                heap[i]->displayRow();
            }
        }
        UI::pause();
    }

    void processJobs() {
        UI::drawHeader("SIMULATING PRINTERS");
        cout << "  Active Printers: " << UI::primary() << PRINTERS << UI::reset() << "\n\n";

        while (size > 0) {
            int active = 0;
            for (int p = 0; p < PRINTERS && size > 0; p++) {
                int idx = -1;
                for (int i = 0; i < size; i++) {
                    if (heap[i]->status == "Queued") { idx = i; break; }
                }

                if (idx == -1) break;

                PrintJob* job = heap[idx];
                cout << "  Printer " << (p + 1) << " processing: " << UI::primary() << job->jobID << UI::reset() << "\n";

                // Progress Bar Animation
                for (int k = 0; k <= 100; k += 10) {
                    cout << "\r  ";
                    UI::drawProgressBar(k, 30);
                    cout.flush();
                    this_thread::sleep_for(chrono::milliseconds(job->timeRemaining * 10)); // Scaled down for demo
                }
                cout << endl << "  " << UI::success() << "[DONE] Printed Successfully." << UI::reset() << "\n\n";

                // Remove logic
                swapJobs(idx, size - 1);
                map.remove(heap[size - 1]->jobID);
                delete heap[size - 1];
                size--;
                if (idx < size) { siftUp(idx); siftDown(idx); }
                active++;
            }
            if (active == 0) {
                cout << "\n  " << UI::error() << "[!] All remaining jobs are delayed. Pausing..." << UI::reset() << endl;
                break;
            }
        }
        if (size == 0) cout << "\n  " << UI::success() << "[OK] All jobs completed." << UI::reset() << endl;
        UI::pause();
    }

    // Persistence
    void saveToFile() {
        ofstream fout(JOB_FILE);
        for (int i = 0; i < size; i++)
            fout << heap[i]->jobID << "," << heap[i]->type << "," << heap[i]->priority
            << "," << heap[i]->status << "," << heap[i]->reason << endl;
        fout.close();
    }

    void loadFromFile() {
        ifstream fin(JOB_FILE);
        if (!fin.is_open()) return;
        string line;
        int maxID = 0;
        while (getline(fin, line)) {
            if (line.empty()) continue;
            string t[5]; int c = 0; size_t pos = 0, prev = 0;
            while ((pos = line.find(',', prev)) != string::npos && c < 4) {
                t[c++] = line.substr(prev, pos - prev);
                prev = pos + 1;
            }
            t[c] = line.substr(prev);
            PrintJob* job = new PrintJob(t[0], t[1], stoi(t[2]));
            job->status = t[3]; job->reason = t[4];
            heap[size] = job; map.insert(job->jobID, size); siftUp(size++);

            // Extract numeric part of ID for nextID logic
            string n = "";
            for (char ch : t[0]) if (isdigit(ch)) n += ch;
            if (!n.empty() && stoi(n) > maxID) maxID = stoi(n);
        }
        nextID = maxID + 1;
        fin.close();
    }
};

// ==========================================
//           DASHBOARD & AUTH
// ==========================================

class Dashboard {
public:
    static void showSidebar(MinHeap& app) {
        // In a real TUI, this would be a separate pane. 
        // For simple console, we'll just show a summary header.
        UI::clear();
        cout << UI::border();
        for (int i = 0; i < UI::getWidth(); i++) cout << "=";
        cout << endl;

        cout << "  " << UI::primary() << "SYSTEM STATUS" << UI::reset()
            << " | Jobs: " << UI::info() << app.getJobCount() << UI::reset()
            << " | Delayed: " << UI::error() << app.getDelayedCount() << UI::reset()
            << " | Printers: " << UI::success() << PRINTERS << " Active" << UI::reset() << endl;

        cout << UI::border();
        for (int i = 0; i < UI::getWidth(); i++) cout << "=";
        cout << UI::reset() << endl;
    }
};

bool signup() {
    UI::drawHeader("NEW USER REGISTRATION");
    string u = UI::input("Create Username");

    ifstream fin(USER_FILE);
    string line;
    while (getline(fin, line)) {
        if (line.substr(0, line.find(',')) == u) {
            cout << "\n  " << UI::error() << "[X] User already exists!" << UI::reset() << endl;
            UI::pause();
            return false;
        }
    }
    fin.close();

    string p = UI::input("Create Password");
    ofstream fout(USER_FILE, ios::app);
    fout << u << "," << p << endl;
    fout.close();

    cout << "\n  " << UI::success() << "[OK] Registration Successful!" << UI::reset() << endl;
    UI::pause();
    return true;
}

bool login() {
    int attempts = 0;
    while (attempts < 3) {
        UI::drawHeader("USER LOGIN");
        if (attempts > 0) cout << "  " << UI::warning() << "Attempts remaining: " << (3 - attempts) << UI::reset() << "\n\n";

        string u = UI::input("Username");
        string p = UI::input("Password");

        ifstream fin(USER_FILE);
        string line;
        bool found = false;
        while (getline(fin, line)) {
            size_t pos = line.find(',');
            if (line.substr(0, pos) == u && line.substr(pos + 1) == p) {
                found = true;
                break;
            }
        }

        if (found) {
            cout << "\n  " << UI::success() << "[OK] Access Granted." << UI::reset() << endl;
            this_thread::sleep_for(chrono::milliseconds(800));
            return true;
        }
        else {
            cout << "\n  " << UI::error() << "[X] Invalid Credentials." << UI::reset() << endl;
            attempts++;
            UI::pause();
        }
    }
    return false;
}

// ==========================================
//               MAIN MENU
// ==========================================
int main() {
    UI::init();

    // Loading Animation
    UI::clear();
    UI::centerText("INITIALIZING SYSTEM...", 10);
    cout << "\n";
    for (int i = 0; i <= 100; i += 5) {
        cout << "\r";
        UI::centerText("", 0); // clear line
        cout << "\r";
        // Manual centering for progress bar is tricky, just show it
        cout << "                                        "; // indent
        UI::drawProgressBar(i, 40);
        cout.flush();
        this_thread::sleep_for(chrono::milliseconds(30));
    }

    // Welcome Screen
    UI::clear();
    cout << UI::primary() << "\n\n";
    cout << R"(
           _____  _____  _____ _   _ _______   _____  _____  _____   _____  _      ______ 
          |  __ \|  __ \|_   _| \ | |__   __| / ____||  __ \|  __ \ / __ \| |    |  ____|
          | |__) | |__) | | | |  \| |  | |   | (___  | |__) | |  | | |  | | |    | |__   
          |  ___/|  _  /  | | | . ` |  | |    \___ \ |  ___/| |  | | |  | | |    |  __|  
          | |    | | \ \ _| |_| |\  |  | |    ____) || |    | |__| | |__| | |____| |____ 
          |_|    |_|  \_\_____|_| \_|  |_|   |_____/ |_|    |_____/ \____/|______|______|
    )" << UI::reset() << "\n\n";
    UI::centerText("Advanced Print Spooling System v3.0");
    cout << "\n\n";
    UI::centerText("Press Any Key to Start");
    _getch();

    // --- Authentication Loop ---
    bool authenticated = false;
    while (!authenticated) {
        Menu authMenu("AUTHENTICATION", { "Login", "Sign Up", "Exit System" });
        int choice = authMenu.show();

        if (choice == 1) {
            authenticated = login();
        }
        else if (choice == 2) {
            signup();
        }
        else if (choice == 3) {
            cout << "Goodbye.\n";
            return 0;
        }
    }

    MinHeap app;

    // --- Main Dashboard Loop ---
    while (true) {
        Dashboard::showSidebar(app);

        cout << "\n";
        Menu mainMenu("MAIN DASHBOARD", {
            "Add New Job",
            "Cancel Job",
            "Update Job (Prio/Status)",
            "List Pending Jobs",
            "RUN Simulation",
            "Theme Settings",
            "Save & Exit"
            });

        int choice = mainMenu.show();

        switch (choice) {
        case 1: 
            app.addJob();
            break;
        case 2:
            app.cancelJob(); 
            break;
        case 3:
            app.updateJob();
            break;
        case 4:
            app.listJobs();
            break;
        case 5:
            app.processJobs();
            break;
        case 6: {
            Menu themeMenu("SELECT THEME", { "Modern (Default)", "Classic (Green)", "Light Mode", "Dark Mode" });
            int t = themeMenu.show();
            if (t == 1) {
                UI::setTheme(MODERN);
            }
            else if (t == 2) {
                UI::setTheme(CLASSIC);
            }
            else if (t == 3) {
                UI::setTheme(LIGHT);
            }
            else {
                UI::setTheme(DARK);
            }
            break;
        }
        case 7:
            UI::clear();
            UI::centerText("Saving Data...", 10);
            this_thread::sleep_for(chrono::milliseconds(500));
            return 0;
        }
    }

    return 0;
}