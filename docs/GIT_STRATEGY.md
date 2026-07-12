# KyleOS — Git and Cutover Strategy

How the rewrite gets built, shipped, and how the old site dies.

---

## 1. New repository. Clean history.

**Decision:** KyleOS is built in a **new repository**, not a branch of the existing portfolio.

**Reasoning:** this repo goes public and is itself a portfolio piece (DESIGN.md §2). Reusing the old repo would carry its entire history with it — every early commit, every value that got hardcoded before it got fixed, every abandoned experiment. Rewriting history to hide that is fragile and dishonest. Starting clean is neither.

There is also nothing to salvage. This is a total rewrite against a new design, a new stack, and a new backend. A long-lived rewrite branch would sit next to a `main` nobody is touching, which is a branch pretending to be a repo.

**Consequence:** the first commit is the whole story. Make it a good one.

---

## 2. Private during the build. Public at launch.

| Phase | Visibility |
|---|---|
| 0 → 5 | **Private** |
| 6 (after the final Review Gate) | **Public** |

**Reasoning:** a half-built KyleOS with a broken editor and placeholder copy is not what someone should find when they search Kyle's name. Flip it after the last gate passes, when the code is what he wants judged.

**Critical:** flipping private → public exposes the **entire commit history**, retroactively. There is no "only from here on." So:

- The **leak check runs from commit #1** (Phase 0, ADR-006). Not added later.
- Nothing environment-specific is ever committed, even while private. "I'll clean it up before it goes public" is how repos leak.
- Before flipping, run the leak check against the **full history**, not just the working tree:

```bash
git rev-list --all | while read -r sha; do
  git grep -nIE 'AKIA|[0-9]{12}|arn:aws|execute-api|amazonaws\.com|us-[a-z]+-[0-9]' "$sha" \
    -- ':!*.example.*' ':!reference/' && echo "  ↑ in $sha"
done
# must return nothing
```

If it finds something, the honest fix is a fresh repo, not `filter-branch`.

---

## 3. Branching

**Trunk-based. Short-lived branches. `main` is always deployable.**

```
main
 ├── phase/0-foundation      → PR → squash merge
 ├── phase/1-desktop-shell   → PR → squash merge
 ├── phase/2-mobile-shell    → PR → squash merge
 ├── phase/3-infrastructure  → PR → squash merge
 ├── phase/4-auth-editor     → PR → squash merge
 └── phase/5-cicd            → PR → squash merge
```

- **One branch per phase.** Named `phase/N-slug`.
- **Never commit to `main` directly.** Branch protection on.
- **A PR merges only after the Review Gate passes.** The gate is the merge criterion, not a suggestion.
- **Squash merge.** One commit per phase on `main`. The history reads as the story of the build, not a diary of the debugging.
- Work-in-progress commits inside a branch can be messy. They get squashed away.
- Conventional commits on the squashed message: `feat: desktop shell — windows, dock, spotlight (phase 1)`

**Inside a phase**, if the work is large, use short-lived sub-branches off the phase branch. Do not let them live more than a day or two.

---

## 4. `main` deploys — but not to the domain

From Phase 5, a merge to `main` deploys automatically. **This does not mean the new site is live at Kyle's domain.**

- The new stack gets its **own CloudFront distribution**, reachable at its `*.cloudfront.net` URL (and optionally a `next.` subdomain).
- The **old site keeps serving the apex domain**, untouched, on its own distribution.
- The two run side by side. Nothing about the new deploy can break the live site, because they share no infrastructure.

This is what makes the whole rewrite safe: **there is no big-bang cutover.** The new site is real, deployed, and testable long before it is *the* site.

---

## 5. Cutover

Cutover is a **DNS change**. That is the entire operation.

1. New stack is deployed, Phase 6 gate has passed, real content is entered through the editor, break-glass has been tested.
2. Kyle uses the new site at its own URL for a few days. Actually uses it — edits content, checks it on his phone.
3. **Switch the Route 53 alias records** (apex + `www`) from the old distribution to the new one.
4. Watch it.

**Rollback is switching the records back.** Seconds. No rebuild, no redeploy, no panic. The old distribution is still sitting there, still serving, still correct.

Lower the TTL on the apex records to 60s a day *before* the switch so a rollback actually propagates fast. Raise it again a week later.

---

## 6. Getting rid of the old code

Nothing is deleted until the new site has been live and healthy for **two weeks**.

**After the rollback window closes:**

- [ ] **Old repo → Archive, not delete.** GitHub's archive makes it read-only and preserves it. It costs nothing, keeps any inbound links alive, and there is no upside to destroying it. Add a line to its README pointing at the new repo.
- [ ] **Old infrastructure → destroy.** Whatever the old site ran on (bucket, distribution, any Lambdas), tear it down. If it was not Terraform-managed, this is manual — and it is the last time Kyle ever has to do that, because ADR-007 says if it is not in Terraform, it does not exist.
- [ ] **Old DNS records → remove** any that no longer point anywhere.
- [ ] **Cost check.** Confirm the old stack has stopped billing. This is the step everyone forgets.

**Do not:**
- ❌ Delete the old repo. Archiving is strictly better.
- ❌ Tear down the old distribution before the two weeks are up. It *is* the rollback.
- ❌ Copy old code into the new repo "just in case." It is a rewrite. If something is worth keeping, it gets rewritten to the standard in CONVENTIONS.md §0, or it does not come.

---

## 7. Kyle's checklist

Things only Kyle can do:

- [ ] Create the new repo, **private**
- [ ] Branch protection on `main`: no direct pushes, PR required, CI must pass
- [ ] GitHub repo variables + secrets: `AWS_REGION`, `AWS_DEPLOY_ROLE_ARN`, `TF_STATE_BUCKET`
- [ ] Confirm which AWS account, and whether the domain is already in Route 53
- [ ] Lower apex DNS TTL to 60s the day before cutover
- [ ] Flip the repo to **public** after the Phase 6 gate
- [ ] Archive the old repo, two weeks after cutover
- [ ] Destroy the old infrastructure, and verify the bill drops
