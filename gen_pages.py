"""Generate all section HTML pages for Project Threshold."""
import os, textwrap

PAGES_DIR = "public/pages"
os.makedirs(PAGES_DIR, exist_ok=True)

def page(filename, accent, eyebrow, title, subtitle, body_html):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} — Project Threshold</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../css/section.css" />
  <style>:root{{--accent:{accent};}}</style>
</head>
<body>
<div class="page-wrap">
  <nav class="back-nav">
    <a href="../index.html" class="back-btn"><span class="back-btn__arrow">←</span> Home</a>
    <span class="breadcrumb">Project Threshold / <span>{title}</span></span>
  </nav>
  <header class="section-header">
    <p class="section-header__eyebrow">{eyebrow}</p>
    <h1>{title}</h1>
    <p class="section-header__sub">{subtitle}</p>
  </header>
{body_html}
</div>
<script>
document.querySelectorAll('.toggle').forEach(t=>t.addEventListener('click',()=>t.classList.toggle('on')));
</script>
</body>
</html>"""

# ── PAGE DEFINITIONS ───────────────────────────────────────────────────────
pages = {}

# LOGIN
pages["login.html"] = page(
    "login.html", "#39ff14", "Access Portal", "Login",
    "Authenticate to access the full research database",
    """
  <div class="form-panel">
    <div class="form-group">
      <label for="username">Username</label>
      <input type="text" id="username" placeholder="Enter username" autocomplete="username" />
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" id="password" placeholder="Enter password" autocomplete="current-password" />
    </div>
    <button class="btn-primary btn-full" type="button">Login &nbsp;»</button>
    <p style="text-align:center;margin-top:18px;font-size:.7rem;color:#456070;letter-spacing:.08em;">
      <a href="#" style="color:#39ff14;text-decoration:none;">Forgot password?</a>
    </p>
  </div>
  <div class="prose" style="max-width:480px;margin:0 auto;">
    <h3>Access Levels</h3>
    <p>Standard accounts may view public encounter reports and submit experiences. Verified Researcher accounts unlock cross-referenced data, heat maps, and the raw evidence archive.</p>
    <h3>New Researcher?</h3>
    <p>Registration is by invitation from a verified community member. Reach out via the Community Forum to request access.</p>
  </div>
""")

# SETTINGS
pages["settings.html"] = page(
    "settings.html", "#00f0ff", "Account Configuration", "Settings",
    "Manage your preferences, notifications, display and security",
    """
  <div class="settings-group">
    <div class="settings-group__title">Preferences</div>
    <div class="settings-row">
      <div><div class="settings-row__label">Auto-classify reports</div><div class="settings-row__desc">AI-assisted entity classification on submission</div></div>
      <div class="toggle on"></div>
    </div>
    <div class="settings-row">
      <div><div class="settings-row__label">Show corroboration score</div><div class="settings-row__desc">Display cross-reference match percentage on reports</div></div>
      <div class="toggle on"></div>
    </div>
    <div class="settings-row">
      <div><div class="settings-row__label">Dark star-field background</div><div class="settings-row__desc">Immersive background across all section pages</div></div>
      <div class="toggle on"></div>
    </div>
  </div>
  <div class="settings-group">
    <div class="settings-group__title">Notifications</div>
    <div class="settings-row">
      <div><div class="settings-row__label">New overlapping report alerts</div><div class="settings-row__desc">Notify when a new report matches your region</div></div>
      <div class="toggle on"></div>
    </div>
    <div class="settings-row">
      <div><div class="settings-row__label">Community forum replies</div><div class="settings-row__desc">Notify on replies to your threads</div></div>
      <div class="toggle"></div>
    </div>
    <div class="settings-row">
      <div><div class="settings-row__label">Evidence archive updates</div><div class="settings-row__desc">Weekly digest of new evidence submissions</div></div>
      <div class="toggle on"></div>
    </div>
  </div>
  <div class="settings-group">
    <div class="settings-group__title">Display</div>
    <div class="settings-row">
      <div><div class="settings-row__label">High-contrast neon borders</div><div class="settings-row__desc">Increase glow intensity for readability</div></div>
      <div class="toggle"></div>
    </div>
    <div class="settings-row">
      <div><div class="settings-row__label">Reduced motion</div><div class="settings-row__desc">Disable pulse animations and transitions</div></div>
      <div class="toggle"></div>
    </div>
  </div>
  <div class="settings-group">
    <div class="settings-group__title">Security</div>
    <div class="settings-row">
      <div><div class="settings-row__label">Two-factor authentication</div><div class="settings-row__desc">Require OTP on login</div></div>
      <div class="toggle on"></div>
    </div>
    <div class="settings-row">
      <div><div class="settings-row__label">Anonymous report mode</div><div class="settings-row__desc">Strip identifying metadata from submissions</div></div>
      <div class="toggle"></div>
    </div>
  </div>
  <div class="settings-group">
    <div class="settings-group__title">Account</div>
    <div class="settings-row">
      <div><div class="settings-row__label">Researcher ID</div><div class="settings-row__desc">PT-2024-0771</div></div>
      <div></div>
    </div>
    <div class="settings-row">
      <div><div class="settings-row__label">Access tier</div><div class="settings-row__desc">Verified Researcher</div></div>
      <div></div>
    </div>
    <div class="settings-row">
      <div><div class="settings-row__label">Change password</div><div class="settings-row__desc"></div></div>
      <a href="#" class="btn-primary" style="font-size:.65rem;padding:6px 14px;">Update</a>
    </div>
  </div>
""")

# REPORT AN EXPERIENCE
pages["report.html"] = page(
    "report.html", "#ffe600", "Submit Evidence", "Report an Experience",
    "Share. Document. Make an Impact.",
    """
  <div class="stat-row">
    <div class="stat"><span class="stat__value">4,218</span><span class="stat__label">Reports filed</span></div>
    <div class="stat"><span class="stat__value">89%</span><span class="stat__label">Cross-matched</span></div>
    <div class="stat"><span class="stat__value">37</span><span class="stat__label">Active regions</span></div>
  </div>
  <div class="form-panel" style="max-width:640px;">
    <div class="form-group">
      <label for="exp-type">Experience type</label>
      <select id="exp-type">
        <option>Direct visual sighting</option>
        <option>Auditory encounter</option>
        <option>Physical evidence found</option>
        <option>Fear / psychological event</option>
        <option>Multiple witnesses</option>
        <option>Technology anomaly</option>
      </select>
    </div>
    <div class="form-group">
      <label for="exp-date">Date of experience</label>
      <input type="date" id="exp-date" />
    </div>
    <div class="form-group">
      <label for="exp-location">Location (general area)</label>
      <input type="text" id="exp-location" placeholder="e.g. Pacific Northwest, WA" />
    </div>
    <div class="form-group">
      <label for="exp-desc">Detailed account</label>
      <textarea id="exp-desc" placeholder="Describe what you observed in as much detail as possible…"></textarea>
    </div>
    <div class="form-group">
      <label for="exp-entity">Entity description (if applicable)</label>
      <input type="text" id="exp-entity" placeholder="Height, build, features, behaviour…" />
    </div>
    <div class="form-group">
      <label for="exp-fear">Fear response (1 = none, 10 = extreme)</label>
      <input type="range" id="exp-fear" min="1" max="10" value="5" style="accent-color:#ffe600;" />
    </div>
    <button class="btn-primary btn-full" type="button">Submit Report &nbsp;»</button>
  </div>
""")

# OVERLAPPING REPORTS
pages["overlapping-reports.html"] = page(
    "overlapping-reports.html", "#39ff14", "Cross-Reference Analysis", "Overlapping Reports",
    "Geographic, temporal and behavioural pattern correlation across independent witnesses",
    """
  <div class="stat-row">
    <div class="stat"><span class="stat__value">312</span><span class="stat__label">Cluster groups</span></div>
    <div class="stat"><span class="stat__value">78%</span><span class="stat__label">Behavioural match</span></div>
    <div class="stat"><span class="stat__value">6</span><span class="stat__label">Active hotspots</span></div>
  </div>
  <ul class="report-list">
    <li class="report-item">
      <div class="report-item__id">OVL-0041</div>
      <div class="report-item__body">
        <h3>Olympic Peninsula Cluster — 14 Corroborating Accounts</h3>
        <p>Fourteen independent reports within a 12-mile radius over 8 months describe an identical upright biped, consistent height estimate 8–9 ft, phosphorescent eye shine, and an infrasonic vocalization preceding each encounter.</p>
        <div class="report-item__meta"><span class="tag">DNA Sample</span><span class="tag">Thermal</span><span class="tag">Multi-witness</span></div>
      </div>
    </li>
    <li class="report-item">
      <div class="report-item__id">OVL-0038</div>
      <div class="report-item__body">
        <h3>Appalachian Night-Stalker Series — 9 Reports</h3>
        <p>Reports spanning West Virginia, Kentucky and Tennessee share a matching fear-induction pattern: paralysis, auditory hallucination and 20-minute memory gap post-encounter.</p>
        <div class="report-item__meta"><span class="tag">Fear Event</span><span class="tag">Temporal</span></div>
      </div>
    </li>
    <li class="report-item">
      <div class="report-item__id">OVL-0035</div>
      <div class="report-item__body">
        <h3>Pacific Coast Canid Biped — 6 Reports</h3>
        <p>Canis-featured bipedal entity sighted across a coastal corridor. Witnesses describe identical amber eye colour, elongated snout and deliberate approach behaviour.</p>
        <div class="report-item__meta"><span class="tag">Canid</span><span class="tag">Biped</span><span class="tag">Coastal</span></div>
      </div>
    </li>
    <li class="report-item">
      <div class="report-item__id">OVL-0029</div>
      <div class="report-item__body">
        <h3>Great Lakes Infrasound Events — 22 Reports</h3>
        <p>Anomalous low-frequency emissions (14–18 Hz) corroborated by civilian and military sensor data coincide with 22 encounter reports across five states.</p>
        <div class="report-item__meta"><span class="tag">Infrasound</span><span class="tag">Technology</span><span class="tag">Sensor Data</span></div>
      </div>
    </li>
  </ul>
""")

# ENCOUNTER REPORTS
pages["encounter-reports.html"] = page(
    "encounter-reports.html", "#ff00c8", "Field Accounts", "Encounter Reports",
    "First-hand witness accounts of direct contact with unidentified entities",
    """
  <div class="stat-row">
    <div class="stat"><span class="stat__value">1,847</span><span class="stat__label">Total reports</span></div>
    <div class="stat"><span class="stat__value">143</span><span class="stat__label">Verified accounts</span></div>
    <div class="stat"><span class="stat__value">62%</span><span class="stat__label">Night encounters</span></div>
  </div>
  <ul class="report-list">
    <li class="report-item">
      <div class="report-item__id">ENC-1204</div>
      <div class="report-item__body">
        <h3>Direct Visual — Upright Biped, 9 ft, Forest Edge</h3>
        <p>Witness describes entity stepping from tree line 40 ft away, maintaining eye contact for approximately 90 seconds before retreating. No aggression. Witness reports involuntary paralysis during event.</p>
        <div class="report-item__meta"><span class="tag">Visual</span><span class="tag">Paralysis</span><span class="tag">Solo witness</span></div>
      </div>
    </li>
    <li class="report-item">
      <div class="report-item__id">ENC-1198</div>
      <div class="report-item__body">
        <h3>Canid Biped — Road Crossing, Multiple Witnesses</h3>
        <p>Three occupants of a vehicle report a wolf-featured bipedal entity crossing a rural highway at speed. Entity clears 40 ft road in two strides. Estimated speed 35 mph.</p>
        <div class="report-item__meta"><span class="tag">Canid</span><span class="tag">Multi-witness</span><span class="tag">High-speed</span></div>
      </div>
    </li>
    <li class="report-item">
      <div class="report-item__id">ENC-1183</div>
      <div class="report-item__body">
        <h3>Auditory — Infrasonic Vocalisations, Campsite</h3>
        <p>Six campers report progressive fear escalation over three nights preceding a visual sighting on night four. Audio recordings capture anomalous sub-20Hz frequencies.</p>
        <div class="report-item__meta"><span class="tag">Auditory</span><span class="tag">Infrasound</span><span class="tag">6 witnesses</span></div>
      </div>
    </li>
    <li class="report-item">
      <div class="report-item__id">ENC-1170</div>
      <div class="report-item__body">
        <h3>Physical Contact — Handprint, Vehicle Roof</h3>
        <p>Witness woke to vehicle rocking and found a five-digit handprint spanning 22 inches across roof panel. Dermal ridge analysis inconclusive. Impression cast archived.</p>
        <div class="report-item__meta"><span class="tag">Physical</span><span class="tag">Cast archived</span><span class="tag">Solo</span></div>
      </div>
    </li>
  </ul>
""")

# FEAR & INTIMIDATION
pages["fear-intimidation.html"] = page(
    "fear-intimidation.html", "#00f0ff", "Psychological Impact Data", "Fear & Intimidation Reports",
    "Documented cases of entity-induced psychological distress and paralysis events",
    """
  <div class="stat-row">
    <div class="stat"><span class="stat__value">634</span><span class="stat__label">Fear events</span></div>
    <div class="stat"><span class="stat__value">91%</span><span class="stat__label">Report paralysis</span></div>
    <div class="stat"><span class="stat__value">4.2x</span><span class="stat__label">Avg fear amplification</span></div>
  </div>
  <div class="prose">
    <h3>The Fear-Control Hypothesis</h3>
    <p>A statistically significant proportion of encounter reports describe an involuntary fear response disproportionate to the perceived threat. Witnesses with no prior anxiety disorders report full-body paralysis, auditory hallucination and acute terror lasting 60–120 seconds, regardless of entity behaviour.</p>
    <p>The hypothesis under investigation: entities may possess a biological or technologically-assisted mechanism capable of triggering the human amygdala remotely — consistent with infrasonic frequency emission at 18–19 Hz, which is known to induce dread, disorientation and visual disturbance.</p>
    <h3>Common Reported Symptoms</h3>
    <p>Full-body paralysis (91%) · Chest compression sensation (78%) · Time dilation (65%) · Auditory hallucination (58%) · Post-event amnesia (34%) · Prolonged sleep disruption (82%)</p>
  </div>
  <ul class="report-list">
    <li class="report-item">
      <div class="report-item__id">FI-0287</div>
      <div class="report-item__body">
        <h3>Complete Paralysis, 4-Minute Duration, No Visual Contact</h3>
        <p>Witness reports sudden immobility and acute fear while hiking alone. No entity seen. Paralysis broke upon sunrise. Area subsequently cross-matched with six other reports within one mile.</p>
        <div class="report-item__meta"><span class="tag">Paralysis</span><span class="tag">No visual</span><span class="tag">Cluster zone</span></div>
      </div>
    </li>
    <li class="report-item">
      <div class="report-item__id">FI-0271</div>
      <div class="report-item__body">
        <h3>Directed Fear — Entity Maintaining Eye Contact</h3>
        <p>Witness describes terror escalating in direct proportion to eye contact duration with entity. Fear ceased immediately when eye contact broke. Suggests deliberate rather than incidental induction.</p>
        <div class="report-item__meta"><span class="tag">Directed</span><span class="tag">Visual contact</span><span class="tag">Cessation documented</span></div>
      </div>
    </li>
  </ul>
""")

# LESSONS
pages["lessons.html"] = page(
    "lessons.html", "#ff6a00", "Integrated Research", "Lessons — Integrated Reports",
    "Synthesised research combining encounter data with theoretical frameworks",
    """
  <div class="card-grid">
    <div class="card">
      <div class="card__label">Lesson 01</div>
      <h2>Pattern Recognition Before Panic</h2>
      <p>Witnesses who identified infrasonic onset symptoms early reported 60% lower fear scores and retained clearer post-event memory.</p>
      <span class="card__tag">Psychological</span>
    </div>
    <div class="card">
      <div class="card__label">Lesson 02</div>
      <h2>Break Eye Contact Early</h2>
      <p>Cross-analysis of 200+ reports shows fear-induction intensity correlates directly with sustained eye contact. Deliberate gaze aversion reduces escalation.</p>
      <span class="card__tag">Field Protocol</span>
    </div>
    <div class="card">
      <div class="card__label">Lesson 03</div>
      <h2>Group Encounters Differ</h2>
      <p>Solo witnesses report higher fear scores but clearer recall. Group witnesses report distributed paralysis but significant memory fragmentation across the group.</p>
      <span class="card__tag">Multi-witness</span>
    </div>
    <div class="card">
      <div class="card__label">Lesson 04</div>
      <h2>Entity Retreat Triggers</h2>
      <p>Analysis of 89 retreat-observed reports identifies: bright light activation, loud rhythmic noise, and calm vocalisation as the three most consistent deterrents.</p>
      <span class="card__tag">Field Protocol</span>
    </div>
    <div class="card">
      <div class="card__label">Lesson 05</div>
      <h2>Temporal Clustering</h2>
      <p>72% of reported encounters cluster between 11 PM – 3 AM and peak in autumn months, suggesting behavioural rather than random distribution.</p>
      <span class="card__tag">Statistical</span>
    </div>
    <div class="card">
      <div class="card__label">Lesson 06</div>
      <h2>Biological Derivation Indicators</h2>
      <p>Wound patterns, footprint dermal ridges, and shed biological material from seven incidents are inconsistent with known fauna but share structural motifs across geographies.</p>
      <span class="card__tag">Biological</span>
    </div>
  </div>
""")

# EXPLORE THEORY
pages["explore-theory.html"] = page(
    "explore-theory.html", "#00f0ff", "Speculative Hypothesis", "Explore the Theory",
    "Biological derivation as a fear control mechanism — the case for investigation",
    """
  <div class="prose">
    <h3>The Core Hypothesis</h3>
    <p>The Project Threshold hypothesis proposes that entities described in cryptid encounter reports — particularly those exhibiting Sasquatch and canid-biped characteristics — may represent a deliberate biological derivation: organisms engineered or selectively conditioned to exploit human fear responses as a population-control mechanism.</p>
    <h3>Evidence Pillars</h3>
    <p><strong style="color:#00f0ff;">Pillar 1 — Geographic Correlation:</strong> High-density encounter zones overlap with historical indigenous territorial boundaries and documented covert government land-use projects at a rate exceeding random chance (p &lt; 0.003).</p>
    <p><strong style="color:#00f0ff;">Pillar 2 — Infrasonic Emission:</strong> Seventeen independently recorded encounters capture sub-20 Hz audio consistent with deliberate infrasonic fear-induction. No known natural fauna produces this signature in the recorded pattern.</p>
    <p><strong style="color:#00f0ff;">Pillar 3 — Behavioural Restraint:</strong> Despite physical capacity suggesting lethal capability, zero credible fatalities are attributed to direct entity aggression. Encounters terminate upon achieving maximum fear response — consistent with a control function rather than a predatory one.</p>
    <p><strong style="color:#00f0ff;">Pillar 4 — Biological Anomalies:</strong> Tissue and hair samples from three separate incidents carry mitochondrial markers inconsistent with any catalogued species but share 94% nuclear DNA with Homo sapiens.</p>
    <h3>Counter-Arguments Under Investigation</h3>
    <p>The misidentification hypothesis, folklore-priming bias and mass psychogenic illness are each examined in the full research archive. None account for the physical evidence or multi-witness technological corroboration at the rate observed.</p>
    <h3>What This Means</h3>
    <p>If the hypothesis holds, these entities are not supernatural — they are biological tools. Understanding the mechanism of fear induction is therefore not merely academic; it is the first step toward neutralising it.</p>
  </div>
  <div style="text-align:center;">
    <a href="neutralizing-fear.html" class="btn-primary">Neutralizing Fear Techniques &nbsp;»</a>
  </div>
""")

# EVIDENCE
pages["evidence.html"] = page(
    "evidence.html", "#39ff14", "Physical & Digital Archive", "Evidence & Encounters",
    "Photos, audio, thermal imagery, track castings and multi-witness corroboration",
    """
  <div class="stat-row">
    <div class="stat"><span class="stat__value">2,104</span><span class="stat__label">Evidence items</span></div>
    <div class="stat"><span class="stat__value">17</span><span class="stat__label">Audio recordings</span></div>
    <div class="stat"><span class="stat__value">41</span><span class="stat__label">Track castings</span></div>
    <div class="stat"><span class="stat__value">8</span><span class="stat__label">Tissue samples</span></div>
  </div>
  <ul class="report-list">
    <li class="report-item">
      <div class="report-item__id">EVD-0812</div>
      <div class="report-item__body">
        <h3>Thermal Imaging — Upright Figure, 9.2 ft Estimated Height</h3>
        <p>FLIR footage captured by trail camera shows bilateral thermal mass inconsistent with known fauna. Heat signature distributed across upper body with reduced limb radiation — atypical.</p>
        <div class="report-item__meta"><span class="tag">Thermal</span><span class="tag">Authenticated</span><span class="tag">Olympic WA</span></div>
      </div>
    </li>
    <li class="report-item">
      <div class="report-item__id">EVD-0798</div>
      <div class="report-item__body">
        <h3>Audio — 17.3 Hz Infrasonic Recording, 4-Minute Continuous</h3>
        <p>Seismic-grade microphone deployed at known encounter site captures four minutes of continuous 17.3 Hz emission. Frequency analysis shows harmonic modulation inconsistent with geological or mechanical origin.</p>
        <div class="report-item__meta"><span class="tag">Audio</span><span class="tag">Infrasound</span><span class="tag">Peer reviewed</span></div>
      </div>
    </li>
    <li class="report-item">
      <div class="report-item__id">EVD-0743</div>
      <div class="report-item__body">
        <h3>Track Casting — 22-Inch Five-Digit Print, Dermal Ridges Intact</h3>
        <p>Silicone casting preserves dermal ridge patterns across all five digits. Pattern does not match any catalogued primate. Mid-tarsal pressure distribution indicates habitual bipedal gait.</p>
        <div class="report-item__meta"><span class="tag">Cast</span><span class="tag">Biped gait</span><span class="tag">Archive held</span></div>
      </div>
    </li>
    <li class="report-item">
      <div class="report-item__id">EVD-0701</div>
      <div class="report-item__body">
        <h3>Hair Sample — Nuclear DNA 94% Homo sapiens, mtDNA Unknown</h3>
        <p>Three separate labs returned concordant results. Nuclear genome proximity to H. sapiens precludes great-ape classification. Mitochondrial lineage does not appear in any published database.</p>
        <div class="report-item__meta"><span class="tag">DNA</span><span class="tag">Triple-verified</span><span class="tag">Ongoing analysis</span></div>
      </div>
    </li>
  </ul>
""")

# NEUTRALIZING FEAR
pages["neutralizing-fear.html"] = page(
    "neutralizing-fear.html", "#ff00c8", "Countermeasure Research", "Neutralizing Fear Techniques",
    "Evidence-based methods for counteracting entity-induced psychological impact",
    """
  <div class="prose">
    <h3>Why Neutralisation Matters</h3>
    <p>If entity fear-induction is biological — mediated by infrasound or similar mechanism — it is a physical phenomenon acting on a physical nervous system. Physical phenomena can be counteracted. The following techniques are drawn from field researcher self-reports and cross-validated against outcome data.</p>
  </div>
  <div class="card-grid">
    <div class="card">
      <div class="card__label">Technique 01</div>
      <h2>Controlled Breathing — 4-7-8 Pattern</h2>
      <p>Inhale 4 sec, hold 7 sec, exhale 8 sec. Activates parasympathetic response, partially counteracting amygdala hijack. Reported effective in 67% of paralysis onset cases.</p>
      <span class="card__tag">Neurological</span>
    </div>
    <div class="card">
      <div class="card__label">Technique 02</div>
      <h2>Deliberate Gaze Aversion</h2>
      <p>Break direct eye contact immediately. Focus on a peripheral fixed point. Cross-analysis shows fear scores drop 40% within 10 seconds of gaze aversion.</p>
      <span class="card__tag">Field Protocol</span>
    </div>
    <div class="card">
      <div class="card__label">Technique 03</div>
      <h2>Vocalisation — Low, Rhythmic</h2>
      <p>Humming or low-frequency deliberate vocalisation at 85–110 Hz appears to partially mask infrasonic reception. 12 of 18 researchers report measurable fear reduction.</p>
      <span class="card__tag">Acoustic</span>
    </div>
    <div class="card">
      <div class="card__label">Technique 04</div>
      <h2>Grounding — Physical Sensation Focus</h2>
      <p>Press feet firmly to ground, grip a solid object, name five things you can physically feel. Redirects cognitive resources away from fear amplification loop.</p>
      <span class="card__tag">Cognitive</span>
    </div>
    <div class="card">
      <div class="card__label">Technique 05</div>
      <h2>Bright Light Activation</h2>
      <p>High-lumen torch activation toward (not directly at) the entity correlated with retreat in 74% of applicable reports. Carry minimum 1000-lumen device in field.</p>
      <span class="card__tag">Equipment</span>
    </div>
    <div class="card">
      <div class="card__label">Technique 06</div>
      <h2>Pre-Exposure Meditation Training</h2>
      <p>Researchers with an established mindfulness practice of 20+ min/day report 55% lower acute fear scores and 80% better post-event recall than the control group.</p>
      <span class="card__tag">Preventive</span>
    </div>
  </div>
""")

# COMMUNITY FORUM
pages["community.html"] = page(
    "community.html", "#00f0ff", "Researcher Network", "Community Forum",
    "Peer discussion, open investigations and collaborative field research",
    """
  <div class="stat-row">
    <div class="stat"><span class="stat__value">3,402</span><span class="stat__label">Members</span></div>
    <div class="stat"><span class="stat__value">892</span><span class="stat__label">Active threads</span></div>
    <div class="stat"><span class="stat__value">14</span><span class="stat__label">Open investigations</span></div>
  </div>
  <div style="margin-bottom:20px;display:flex;gap:12px;flex-wrap:wrap;">
    <a href="#" class="btn-primary">+ New Thread</a>
    <a href="#" class="btn-primary">Open Investigations</a>
  </div>
  <div class="forum-thread">
    <div class="forum-thread__title">Olympic Peninsula — Planning a coordinated survey, March 14–16. Who's in?</div>
    <div class="forum-thread__meta">
      <span>Posted by <strong style="color:#8ab8cc;">R. Callahan</strong></span>
      <span class="forum-thread__replies">47 replies</span>
      <span>Last active 2h ago</span>
    </div>
  </div>
  <div class="forum-thread">
    <div class="forum-thread__title">Infrasound recording analysis — I need help interpreting the harmonic modulation pattern in EVD-0798</div>
    <div class="forum-thread__meta">
      <span>Posted by <strong style="color:#8ab8cc;">Dr. M. Voss</strong></span>
      <span class="forum-thread__replies">23 replies</span>
      <span>Last active 6h ago</span>
    </div>
  </div>
  <div class="forum-thread">
    <div class="forum-thread__title">DNA results from the Appalachian sample — the mitochondrial lineage still doesn't match anything published</div>
    <div class="forum-thread__meta">
      <span>Posted by <strong style="color:#8ab8cc;">GenLab_PT</strong></span>
      <span class="forum-thread__replies">61 replies</span>
      <span>Last active 1d ago</span>
    </div>
  </div>
  <div class="forum-thread">
    <div class="forum-thread__title">Technique 03 (vocalisation) — I tested this during my encounter last week and here's what happened</div>
    <div class="forum-thread__meta">
      <span>Posted by <strong style="color:#8ab8cc;">FieldRes_07</strong></span>
      <span class="forum-thread__replies">38 replies</span>
      <span>Last active 3d ago</span>
    </div>
  </div>
  <div class="forum-thread">
    <div class="forum-thread__title">Request: peer review on my overlapping reports analysis for the Great Lakes cluster</div>
    <div class="forum-thread__meta">
      <span>Posted by <strong style="color:#8ab8cc;">A. Mercer</strong></span>
      <span class="forum-thread__replies">15 replies</span>
      <span>Last active 4d ago</span>
    </div>
  </div>
""")

# ── WRITE FILES ────────────────────────────────────────────────────────────
for fname, html in pages.items():
    path = os.path.join(PAGES_DIR, fname)
    with open(path, "w") as f:
        f.write(html)
    print(f"  wrote {path}")

print(f"\nDone — {len(pages)} pages generated.")
