"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("admin-login-form");
    const loginMessage = document.getElementById("admin-login-message");

    const workspace = document.getElementById("admin-workspace");
    const loginScreen = document.getElementById("admin-login");
    const signOutButton = document.getElementById("admin-sign-out");

    const globalMessage = document.getElementById("admin-global-message");

    const jobDialog = document.getElementById("job-dialog");
    const jobForm = document.getElementById("job-form");
    const jobDialogTitle = document.getElementById("job-dialog-title");
    const jobFormMessage = document.getElementById("job-form-message");

    const settingsForm = document.getElementById("company-settings-form");
    const settingsMessage = document.getElementById(
        "company-settings-message"
    );

    /*
     * PHASE 1: FRONTEND ONLY
     *
     * Firebase Authentication, database reads/writes,
     * administrator authorization and persistent storage
     * have not been implemented in this phase.
     *
     * Never treat frontend visibility as authorization.
     */

    function showMessage(element, message) {
        if (element) {
            element.textContent = message;
        }
    }

    function showWorkspaceSection(sectionName) {
        const sections = document.querySelectorAll("[data-admin-section]");
        const navigationButtons = document.querySelectorAll(
            ".admin-nav [data-admin-view]"
        );

        const targetSection = document.querySelector(
            `[data-admin-section="${CSS.escape(sectionName)}"]`
        );

        if (!targetSection) {
            showMessage(globalMessage, "This section is unavailable.");
            return;
        }

        sections.forEach((section) => {
            section.hidden = section !== targetSection;
        });

        navigationButtons.forEach((button) => {
            const isActive = button.dataset.adminView === sectionName;

            button.classList.toggle("active", isActive);

            if (isActive) {
                button.setAttribute("aria-current", "page");
            } else {
                button.removeAttribute("aria-current");
            }
        });

        showMessage(globalMessage, "");
    }

    /*
     * Sidebar navigation and overview shortcuts.
     */

    document.addEventListener("click", (event) => {
        const viewButton = event.target.closest("[data-admin-view]");

        if (viewButton) {
            showWorkspaceSection(viewButton.dataset.adminView);
        }
    });

    /*
     * Login is intentionally disabled until Firebase
     * Authentication and admin authorization are integrated.
     */

    loginForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        showMessage(
            loginMessage,
            "Login is not connected yet. Firebase Authentication and admin authorization will be implemented in Phase 2."
        );
    });

    /*
     * Sign-out remains unavailable until a real Firebase
     * authenticated session exists.
     */

    signOutButton?.addEventListener("click", () => {
        showMessage(
            globalMessage,
            "Sign-out will be enabled after Firebase Authentication is integrated."
        );
    });

    /*
     * Job creation dialog.
     *
     * Opening and validating the form does not save data.
     */

    function openJobDialog() {
        if (!jobDialog?.showModal) {
            showMessage(globalMessage, "The job form is unavailable.");
            return;
        }

        jobForm?.reset();

        const jobId = document.getElementById("job-id");
        const deadline = document.getElementById("job-deadline");

        if (jobId) {
            jobId.value = "";
        }

        if (deadline) {
            deadline.min = new Date().toISOString().slice(0, 10);
        }

        if (jobDialogTitle) {
            jobDialogTitle.textContent = "Create job opening";
        }

        showMessage(jobFormMessage, "");
        jobDialog.showModal();

        document.getElementById("job-title")?.focus();
    }

    document.addEventListener("click", (event) => {
        const openButton = event.target.closest("[data-open-job-form]");

        if (openButton) {
            openJobDialog();
        }
    });

    function closeJobDialog() {
        if (jobDialog?.open) {
            jobDialog.close();
        }
    }

    document.getElementById("close-job-dialog")
        ?.addEventListener("click", closeJobDialog);

    document.getElementById("cancel-job-dialog")
        ?.addEventListener("click", closeJobDialog);

    jobDialog?.addEventListener("click", (event) => {
        if (event.target === jobDialog) {
            closeJobDialog();
        }
    });

    jobDialog?.addEventListener("close", () => {
        showMessage(jobFormMessage, "");
    });

    jobForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!jobForm.reportValidity()) {
            return;
        }

        showMessage(
            jobFormMessage,
            "Job was not saved. Firebase Realtime Database integration is required."
        );
    });

    /*
     * Candidate search.
     *
     * It filters only actual rows explicitly marked as
     * candidate records. Placeholder rows are never treated
     * as real application records.
     */

    const candidateSearch = document.getElementById("candidate-search");
    const candidatesBody = document.getElementById("admin-candidates-body");

    candidateSearch?.addEventListener("input", () => {
        const searchTerm = candidateSearch.value.trim().toLowerCase();

        const rows = candidatesBody?.querySelectorAll(
            "tr[data-candidate-row]"
        ) || [];

        rows.forEach((row) => {
            row.hidden = !row.textContent.toLowerCase().includes(searchTerm);
        });
    });

    /*
     * Company settings form.
     *
     * No information is saved until Firebase integration.
     */

    settingsForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!settingsForm.reportValidity()) {
            return;
        }

        showMessage(
            settingsMessage,
            "Company information was not saved. Firebase integration is required."
        );
    });

    /*
     * No demo records are inserted.
     * No statistics are fabricated.
     * No credentials are stored or transmitted.
     *
     * Keep the admin workspace hidden until Phase 2
     * implements and verifies real authentication.
     */

    if (loginScreen) {
        loginScreen.hidden = false;
    }

    if (workspace) {
        workspace.hidden = true;
    }

    if (signOutButton) {
        signOutButton.hidden = true;
    }
});
