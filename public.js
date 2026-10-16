"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const jobsList = document.getElementById("jobs-list");
    const jobsStatus = document.getElementById("jobs-status");
    const jobsEmpty = document.getElementById("jobs-empty");
    const jobsError = document.getElementById("jobs-error");
    const jobCount = document.getElementById("job-count");

    const searchInput = document.getElementById("job-search");
    const departmentFilter = document.getElementById("department-filter");
    const locationFilter = document.getElementById("location-filter");
    const searchForm = document.getElementById("job-search-form");

    const applicationDialog =
        document.getElementById("application-dialog");

    const applicationForm =
        document.getElementById("application-form");

    const applicationJobId =
        document.getElementById("application-job-id");

    const applicationJobTitle =
        document.getElementById("application-job-title");

    const applicationMessage =
        document.getElementById("application-message");

    const submitButton =
        document.getElementById("submit-application");

    const aboutSection = document.getElementById("about");
    const yearElement = document.getElementById("footer-year");

    /*
     * No sample data is created.
     * Job records will be loaded from Firebase in Phase 2.
     */

    if (yearElement) {
        yearElement.textContent = `© ${new Date().getFullYear()}`;
    }

    if (jobsStatus) {
        jobsStatus.textContent =
            "Job listings will appear here when Firebase is connected.";

        jobsStatus.hidden = false;
    }

    if (jobsList) {
        jobsList.setAttribute("aria-busy", "false");
    }

    if (jobsEmpty) {
        jobsEmpty.hidden = true;
    }

    if (jobsError) {
        jobsError.hidden = true;
    }

    /*
     * Hide the About section until real company
     * information is available.
     */

    if (aboutSection) {
        const aboutHeading =
            aboutSection.querySelector("[data-about-heading]");

        const aboutDescription =
            aboutSection.querySelector("[data-about-description]");

        const hasCompanyInformation =
            Boolean(
                aboutHeading?.textContent.trim() ||
                aboutDescription?.textContent.trim()
            );

        aboutSection.hidden = !hasCompanyInformation;
    }

    /*
     * Job filtering
     *
     * Expected future job-card attributes:
     * data-department="Engineering"
     * data-location="Guwahati"
     *
     * These cards will be generated from Firebase,
     * not from hardcoded example records.
     */

    function getJobCards() {
        return jobsList
            ? Array.from(jobsList.querySelectorAll(".job-card"))
            : [];
    }

    function populateFilter(selectElement, values, placeholder) {
        if (!selectElement) return;

        const previousValue = selectElement.value;
        const options = [
            ...new Set(values.filter(Boolean))
        ].sort((a, b) => a.localeCompare(b));

        selectElement.replaceChildren();

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = placeholder;

        selectElement.appendChild(defaultOption);

        options.forEach((value) => {
            const option = document.createElement("option");

            option.value = value;
            option.textContent = value;

            selectElement.appendChild(option);
        });

        if (options.includes(previousValue)) {
            selectElement.value = previousValue;
        }
    }

    function updateFilterOptions(cards) {
        populateFilter(
            departmentFilter,
            cards.map((card) => card.dataset.department || ""),
            "All departments"
        );

        populateFilter(
            locationFilter,
            cards.map((card) => card.dataset.location || ""),
            "All locations"
        );
    }

    function applyJobFilters() {
        if (!jobsList) return;

        const cards = getJobCards();

        if (cards.length === 0) {
            if (jobsStatus) {
                jobsStatus.hidden = false;
                jobsStatus.textContent =
                    "Job listings will appear here when Firebase is connected.";
            }

            if (jobsEmpty) jobsEmpty.hidden = true;
            if (jobsError) jobsError.hidden = true;
            if (jobCount) jobCount.textContent = "";

            jobsList.setAttribute("aria-busy", "false");
            return;
        }

        if (jobsStatus) {
            jobsStatus.hidden = true;
        }

        updateFilterOptions(cards);

        const searchTerm =
            (searchInput?.value || "").trim().toLowerCase();

        const selectedDepartment =
            departmentFilter?.value || "";

        const selectedLocation =
            locationFilter?.value || "";

        let visibleCount = 0;

        cards.forEach((card) => {
            const searchableText = card.textContent.toLowerCase();

            const departmentMatches =
                !selectedDepartment ||
                card.dataset.department === selectedDepartment;

            const locationMatches =
                !selectedLocation ||
                card.dataset.location === selectedLocation;

            const searchMatches =
                !searchTerm ||
                searchableText.includes(searchTerm);

            const isVisible =
                departmentMatches &&
                locationMatches &&
                searchMatches;

            card.hidden = !isVisible;

            if (isVisible) {
                visibleCount++;
            }
        });

        if (jobCount) {
            jobCount.textContent =
                `${visibleCount} ${visibleCount === 1 ? "position" : "positions"}`;
        }

        if (jobsEmpty) {
            jobsEmpty.hidden = visibleCount !== 0;
        }

        if (jobsError) {
            jobsError.hidden = true;
        }

        jobsList.setAttribute("aria-busy", "false");
    }

    searchInput?.addEventListener("input", applyJobFilters);

    departmentFilter?.addEventListener(
        "change",
        applyJobFilters
    );

    locationFilter?.addEventListener(
        "change",
        applyJobFilters
    );

    searchForm?.addEventListener("reset", () => {
        requestAnimationFrame(applyJobFilters);
    });

    /*
     * Detect job cards when a future Firebase integration
     * adds or removes them from the page.
     */

    if (jobsList) {
        const observer = new MutationObserver((records) => {
            const cardsChanged = records.some((record) => {
                const changedNodes = [
                    ...record.addedNodes,
                    ...record.removedNodes
                ];

                return changedNodes.some((node) => {
                    if (node.nodeType !== Node.ELEMENT_NODE) {
                        return false;
                    }

                    return (
                        node.matches(".job-card") ||
                        Boolean(node.querySelector(".job-card"))
                    );
                });
            });

            if (cardsChanged) {
                applyJobFilters();
            }
        });

        observer.observe(jobsList, {
            childList: true,
            subtree: true
        });
    }

    /*
     * Application dialog
     *
     * Future Firebase-rendered Apply buttons should use:
     *
     * data-apply-job
     * data-job-id="FIREBASE_JOB_ID"
     * data-job-title="Job title"
     */

    document.addEventListener("click", (event) => {
        const applyButton = event.target.closest("[data-apply-job]");

        if (applyButton) {
            const jobId = applyButton.dataset.jobId || "";
            const jobTitle = applyButton.dataset.jobTitle || "";

            if (!jobId.trim()) {
                showApplicationMessage(
                    "This job is missing its identifier. Please try again later."
                );
                return;
            }

            if (!applicationDialog?.showModal) {
                showApplicationMessage(
                    "The application form is not available in this browser."
                );
                return;
            }

            applicationForm?.reset();

            if (applicationJobId) {
                applicationJobId.value = jobId;
            }

            if (applicationJobTitle) {
                applicationJobTitle.textContent = jobTitle;
            }

            if (applicationMessage) {
                applicationMessage.textContent = "";
            }

            applicationDialog.showModal();
        }
    });

    function showApplicationMessage(message) {
        if (applicationMessage) {
            applicationMessage.textContent = message;
        }
    }

    function closeApplicationDialog() {
        if (applicationDialog?.open) {
            applicationDialog.close();
        }
    }

    document.getElementById("close-application")
        ?.addEventListener("click", closeApplicationDialog);

    document.getElementById("cancel-application")
        ?.addEventListener("click", closeApplicationDialog);

    applicationDialog?.addEventListener("click", (event) => {
        if (event.target === applicationDialog) {
            closeApplicationDialog();
        }
    });

    applicationDialog?.addEventListener("close", () => {
        if (applicationMessage) {
            applicationMessage.textContent = "";
        }
    });

    /*
     * Do not accept or pretend to save applications yet.
     * Firebase and Cloudinary submission will be added later.
     */

    applicationForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        showApplicationMessage(
            "Application submission is not connected yet. Your information has not been sent or saved."
        );
    });

    /*
     * Initial state
     */

    applyJobFilters();
});
