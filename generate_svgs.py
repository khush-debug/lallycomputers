#!/usr/bin/env python3
"""
Generates clean, authentic SVG product illustrations for all 67 products in Lally Computers catalogue.
"""
import os
import json

OUT_DIR = "images/products"
os.makedirs(OUT_DIR, exist_ok=True)

def wrap_svg(body, title=""):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width="320" height="240" fill="none">
  <defs>
    <filter id="dropShadow" x="-10%" y="-10%" width="125%" height="130%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity="0.12"/>
    </filter>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <linearGradient id="screenGradMac" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="40%" stop-color="#3b82f6"/>
      <stop offset="70%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
    <linearGradient id="screenGradWin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="50%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#0c4a6e"/>
    </linearGradient>
    <linearGradient id="screenGradGaming" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4c0519"/>
      <stop offset="45%" stop-color="#e11d48"/>
      <stop offset="75%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <linearGradient id="silverBody" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="50%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <linearGradient id="darkChassis" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#27272a"/>
      <stop offset="50%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>
  </defs>
  {body}
</svg>'''

def make_laptop_svg(brand, lid_color="#18181b", base_color="#27272a", screen_grad="screenGradWin", accent_logo=None, is_notch=False):
    # Responsive laptop with screen & base
    logo_svg = ""
    if accent_logo == "apple":
        logo_svg = '''
        <g transform="translate(160, 102) scale(0.7)" fill="#ffffff" opacity="0.95">
          <path d="M12 2C10.5 3.5 10 5.2 10.3 6.8 11.8 6.5 13.5 5.5 14.3 4.2 14.8 3.5 15 2.5 15 1.5 13.8 1.6 12.8 2.1 12 2z"/>
          <path d="M15.5 7.8C13.8 7.8 12.9 6.8 11.2 6.8 9.5 6.8 8.2 8 7.2 9.7 5.2 13.2 6.7 18.5 8.7 21.3 9.7 22.7 10.8 24.2 12.3 24.1c1.5-.1 2.1-1 3.9-1 1.8 0 2.3 1 3.9 1 1.6 0 2.7-1.4 3.7-2.8 1.1-1.6 1.6-3.2 1.6-3.3-.1-.1-3.1-1.2-3.1-4.7 0-3 2.4-4.4 2.5-4.5-1.4-2-3.5-2.2-4.2-2.3-1.8-.2-3.4 1.3-4.1 1.3z"/>
        </g>
        '''
    elif accent_logo == "thinkpad":
        logo_svg = '''
        <g transform="translate(160, 172)">
          <circle cx="0" cy="0" r="2.8" fill="#ef4444" filter="url(#softGlow)"/>
        </g>
        <text x="215" y="180" font-family="sans-serif" font-size="7" font-weight="bold" fill="#71717a">ThinkPad</text>
        <circle cx="244.5" cy="175.5" r="1" fill="#ef4444"/>
        '''
    elif accent_logo == "hp":
        logo_svg = '''
        <g transform="translate(160, 105)" stroke="#ffffff" stroke-width="2.5" opacity="0.9">
          <line x1="-8" y1="-8" x2="-4" y2="8"/>
          <line x1="-2" y1="-8" x2="2" y2="8"/>
          <line x1="4" y1="-8" x2="8" y2="8"/>
        </g>
        '''
    elif accent_logo == "victus":
        logo_svg = '''
        <g transform="translate(160, 102)" fill="#ffffff" opacity="0.9">
          <path d="M-8 -6 L0 8 L8 -6 L4 -6 L0 1 L-4 -6 Z"/>
        </g>
        '''
    elif accent_logo == "dell":
        logo_svg = '''
        <circle cx="160" cy="105" r="8" stroke="#ffffff" stroke-width="1.2" fill="none" opacity="0.85"/>
        <text x="160" y="108" font-family="sans-serif" font-size="6" font-weight="bold" fill="#ffffff" text-anchor="middle" opacity="0.9">DELL</text>
        '''
    elif accent_logo == "lenovo":
        logo_svg = '''
        <rect x="75" y="166" width="22" height="6" fill="#ef4444" rx="1"/>
        <text x="86" y="171" font-family="sans-serif" font-size="4.5" font-weight="bold" fill="#ffffff" text-anchor="middle">Lenovo</text>
        '''

    notch_svg = ''
    if is_notch:
        notch_svg = '<path d="M152 42 H168 V46 A2 2 0 0 1 166 48 H154 A2 2 0 0 1 152 46 Z" fill="#09090b"/>'

    return f'''
    <g filter="url(#dropShadow)">
      <!-- Display Lid -->
      <rect x="68" y="38" width="184" height="118" rx="7" fill="{lid_color}" stroke="#3f3f46" stroke-width="1.5"/>
      <!-- Screen Bezel -->
      <rect x="72" y="42" width="176" height="110" rx="4" fill="#09090b"/>
      <!-- Active Display Area -->
      <rect x="76" y="46" width="168" height="102" rx="2" fill="url(#{screen_grad})"/>
      
      <!-- Webcam & Sensor -->
      <circle cx="160" cy="44" r="1.2" fill="#22d3ee" opacity="0.8"/>
      {notch_svg}
      
      <!-- Graphic/Screen Details -->
      {logo_svg}

      <!-- Screen Gloss Shine -->
      <path d="M76 46 L180 46 L120 148 L76 148 Z" fill="#ffffff" opacity="0.04"/>

      <!-- Hinge -->
      <rect x="135" y="156" width="50" height="5" rx="1.5" fill="#52525b"/>

      <!-- Base / Lower Body (Keyboard deck in perspective) -->
      <path d="M50 162 L270 162 L284 198 A6 6 0 0 1 278 204 L42 204 A6 6 0 0 1 36 198 Z" fill="{base_color}" stroke="#3f3f46" stroke-width="1.2"/>
      
      <!-- Front Edge Bevel -->
      <path d="M42 204 L278 204 L274 207 L46 207 Z" fill="#71717a" opacity="0.6"/>

      <!-- Keyboard Recess -->
      <path d="M68 166 L252 166 L258 186 L62 186 Z" fill="#18181b" opacity="0.85" rx="2"/>
      
      <!-- Trackpad -->
      <rect x="138" y="189" width="44" height="12" rx="2" fill="#27272a" stroke="#52525b" stroke-width="0.8"/>
    </g>
    '''

def make_pc_rig_svg(glow_color="#06b6d4", secondary_glow="#ec4899", has_aio=True):
    return f'''
    <g filter="url(#dropShadow)" transform="translate(20, 0)">
      <!-- Main Chassis -->
      <rect x="80" y="25" width="120" height="185" rx="6" fill="#18181b" stroke="#3f3f46" stroke-width="2"/>
      <!-- Front Panel -->
      <rect x="80" y="25" width="22" height="185" rx="4" fill="#09090b" stroke="#27272a"/>
      <!-- Front Mesh Grille / RGB Strip -->
      <rect x="84" y="45" width="4" height="145" rx="2" fill="{glow_color}" filter="url(#softGlow)"/>
      <circle cx="91" cy="35" r="2.5" fill="#ffffff" opacity="0.8"/>

      <!-- Tempered Glass Side Window -->
      <rect x="105" y="32" width="90" height="170" rx="3" fill="#09090b" stroke="#27272a" stroke-width="1.2"/>
      <rect x="108" y="35" width="84" height="164" rx="2" fill="#030712" opacity="0.95"/>

      <!-- Internal Components -->
      <!-- Motherboard PCB -->
      <rect x="115" y="48" width="72" height="85" fill="#1e1e24"/>

      <!-- AIO Radiator & Fans at Top -->
      <rect x="115" y="37" width="72" height="10" fill="#27272a"/>
      <circle cx="132" cy="42" r="4" fill="{glow_color}" opacity="0.8"/>
      <circle cx="152" cy="42" r="4" fill="{glow_color}" opacity="0.8"/>
      <circle cx="172" cy="42" r="4" fill="{glow_color}" opacity="0.8"/>

      <!-- CPU Pump Block with Infinity Mirror -->
      <circle cx="150" cy="75" r="11" fill="#111827" stroke="{glow_color}" stroke-width="1.8" filter="url(#softGlow)"/>
      <circle cx="150" cy="75" r="6" fill="{secondary_glow}" opacity="0.9"/>
      <!-- Coolant Hoses -->
      <path d="M150 68 Q165 52 172 45" stroke="#374151" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M145 68 Q155 54 158 45" stroke="#1f2937" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- RAM Sticks with RGB -->
      <rect x="170" y="60" width="3" height="18" rx="1" fill="{secondary_glow}" filter="url(#softGlow)"/>
      <rect x="175" y="60" width="3" height="18" rx="1" fill="{glow_color}" filter="url(#softGlow)"/>

      <!-- Heavy Graphics Card (RTX GPU) -->
      <g transform="translate(112, 100)">
        <rect x="0" y="0" width="76" height="24" rx="3" fill="#111827" stroke="#4b5563" stroke-width="1"/>
        <!-- Triple / Dual Fans on GPU -->
        <circle cx="16" cy="12" r="8" fill="#1f2937" stroke="{glow_color}" stroke-width="1"/>
        <circle cx="38" cy="12" r="8" fill="#1f2937" stroke="{secondary_glow}" stroke-width="1"/>
        <circle cx="60" cy="12" r="8" fill="#1f2937" stroke="{glow_color}" stroke-width="1"/>
        <!-- GPU RGB Nameplate -->
        <rect x="8" y="2" width="30" height="3" fill="{glow_color}" opacity="0.9"/>
      </g>

      <!-- PSU Shroud at bottom -->
      <rect x="108" y="155" width="84" height="44" fill="#111827" stroke="#1f2937"/>
      <rect x="118" y="168" width="40" height="16" rx="2" fill="#030712"/>
      <text x="138" y="179" font-family="sans-serif" font-size="5.5" font-weight="bold" fill="#9ca3af" text-anchor="middle">750W GOLD</text>

      <!-- Glass Reflection Highlight -->
      <path d="M108 35 L165 35 L125 199 L108 199 Z" fill="#ffffff" opacity="0.04"/>
    </g>
    '''

def make_gpu_svg(name, fans=2, rgb=True):
    return f'''
    <g filter="url(#dropShadow)" transform="translate(25, 30)">
      <!-- PCIe Gold Finger Board -->
      <rect x="35" y="132" width="60" height="7" rx="1" fill="#eab308"/>
      <!-- PCI Metal Bracket -->
      <path d="M20 15 L28 15 L28 140 L20 140 Z" fill="#94a3b8" stroke="#64748b"/>
      <circle cx="24" cy="40" r="3" fill="#334155"/>
      <circle cx="24" cy="65" r="3" fill="#334155"/>

      <!-- Main GPU Shroud -->
      <rect x="28" y="20" width="220" height="110" rx="8" fill="#18181b" stroke="#3f3f46" stroke-width="1.8"/>
      
      <!-- Backplate / Top Fin Cutouts -->
      <rect x="35" y="26" width="205" height="14" rx="3" fill="#09090b"/>
      <text x="50" y="36" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#22d3ee">GEFORCE RTX</text>
      
      <!-- Heat Sink Fin Arrays Behind Fans -->
      <rect x="40" y="46" width="85" height="74" rx="4" fill="#27272a"/>
      <rect x="140" y="46" width="85" height="74" rx="4" fill="#27272a"/>

      <!-- Fan 1 -->
      <g transform="translate(82, 83)">
        <circle cx="0" cy="0" r="33" fill="#09090b" stroke="#3b82f6" stroke-width="1.8" filter="url(#softGlow)"/>
        <!-- Fan Blades -->
        <path d="M0 -30 Q8 -14 0 0 Q-8 14 0 30" stroke="#374151" stroke-width="3" fill="none"/>
        <path d="M-30 0 Q-14 -8 0 0 Q14 8 30 0" stroke="#374151" stroke-width="3" fill="none"/>
        <path d="M-21 -21 Q-4 -8 0 0 Q4 8 21 21" stroke="#374151" stroke-width="3" fill="none"/>
        <path d="M21 -21 Q8 -4 0 0 Q-8 4 -21 21" stroke="#374151" stroke-width="3" fill="none"/>
        <!-- Fan Center Hub -->
        <circle cx="0" cy="0" r="11" fill="#18181b" stroke="#60a5fa" stroke-width="1.2"/>
        <circle cx="0" cy="0" r="4" fill="#3b82f6"/>
      </g>

      <!-- Fan 2 -->
      <g transform="translate(182, 83)">
        <circle cx="0" cy="0" r="33" fill="#09090b" stroke="#a855f7" stroke-width="1.8" filter="url(#softGlow)"/>
        <path d="M0 -30 Q8 -14 0 0 Q-8 14 0 30" stroke="#374151" stroke-width="3" fill="none"/>
        <path d="M-30 0 Q-14 -8 0 0 Q14 8 30 0" stroke="#374151" stroke-width="3" fill="none"/>
        <path d="M-21 -21 Q-4 -8 0 0 Q4 8 21 21" stroke="#374151" stroke-width="3" fill="none"/>
        <path d="M21 -21 Q8 -4 0 0 Q-8 4 -21 21" stroke="#374151" stroke-width="3" fill="none"/>
        <circle cx="0" cy="0" r="11" fill="#18181b" stroke="#c084fc" stroke-width="1.2"/>
        <circle cx="0" cy="0" r="4" fill="#a855f7"/>
      </g>
    </g>
    '''

def make_monitor_svg(is_curved=False, is_tv=False, brand="LG"):
    screen_grad = "screenGradGaming" if not is_tv else "screenGradMac"
    if is_curved:
        return f'''
        <g filter="url(#dropShadow)" transform="translate(15, 20)">
          <!-- Curved Screen Arc -->
          <path d="M20 50 Q145 28 270 50 L270 145 Q145 125 20 145 Z" fill="#09090b" stroke="#3f3f46" stroke-width="2"/>
          <path d="M24 53 Q145 32 266 53 L266 142 Q145 122 24 142 Z" fill="url(#{screen_grad})"/>
          <!-- Curved Stand Neck -->
          <rect x="138" y="138" width="14" height="42" fill="#27272a"/>
          <!-- V-Wing Stand Base -->
          <path d="M85 195 L145 180 L205 195 L185 195 L145 184 L105 195 Z" fill="#3f3f46" stroke="#71717a"/>
        </g>
        '''
    elif is_tv:
        return f'''
        <g filter="url(#dropShadow)" transform="translate(20, 25)">
          <!-- TV Thin Frame -->
          <rect x="15" y="20" width="250" height="142" rx="4" fill="#09090b" stroke="#3f3f46" stroke-width="1.8"/>
          <!-- 4K Display Panel -->
          <rect x="19" y="24" width="242" height="134" rx="2" fill="url(#{screen_grad})"/>
          <!-- Brand subtle text -->
          <text x="140" y="160" font-family="sans-serif" font-size="5" font-weight="bold" fill="#9ca3af" text-anchor="middle">SAMSUNG 4K</text>
          <!-- Corner Legs -->
          <path d="M45 162 L35 182 L42 182 L50 162 Z" fill="#27272a"/>
          <path d="M235 162 L245 182 L238 182 L230 162 Z" fill="#27272a"/>
        </g>
        '''
    else:
        return f'''
        <g filter="url(#dropShadow)" transform="translate(25, 20)">
          <!-- Ultra-Slim Monitor Frame -->
          <rect x="25" y="25" width="220" height="130" rx="4" fill="#09090b" stroke="#3f3f46" stroke-width="1.5"/>
          <!-- Display -->
          <rect x="28" y="28" width="214" height="120" rx="2" fill="url(#{screen_grad})"/>
          <!-- Red Gaming Accent Ring on rear (visible slightly) -->
          <circle cx="135" cy="85" r="16" fill="none" stroke="#ef4444" stroke-width="1.5" opacity="0.3"/>
          <!-- Stand Neck -->
          <rect x="130" y="155" width="10" height="32" fill="#27272a"/>
          <!-- V-Base -->
          <path d="M80 195 L135 187 L190 195 L175 195 L135 189 L95 195 Z" fill="#18181b" stroke="#ef4444" stroke-width="1"/>
        </g>
        '''

def make_watch_svg(kind="apple_series", color="#0f172a"):
    if "apple" in kind:
        is_ultra = "ultra" in kind
        case_color = "#e2e8f0" if is_ultra else "#1e293b"
        stroke_color = "#f97316" if is_ultra else "#475569"
        band_color = "#f97316" if is_ultra else "#0f172a"
        return f'''
        <g filter="url(#dropShadow)" transform="translate(60, 15)">
          <!-- Top Band -->
          <rect x="68" y="15" width="64" height="50" rx="8" fill="{band_color}"/>
          <!-- Bottom Band -->
          <rect x="68" y="145" width="64" height="50" rx="8" fill="{band_color}"/>
          
          <!-- Watch Case -->
          <rect x="52" y="55" width="96" height="100" rx="24" fill="{case_color}" stroke="{stroke_color}" stroke-width="2"/>
          
          <!-- Digital Crown -->
          <rect x="148" y="75" width="8" height="24" rx="3" fill="#64748b" stroke="#09090b"/>
          <line x1="148" y1="81" x2="156" y2="81" stroke="#334155"/>
          <line x1="148" y1="87" x2="156" y2="87" stroke="#334155"/>
          <line x1="148" y1="93" x2="156" y2="93" stroke="#334155"/>
          <!-- Side Button -->
          <rect x="148" y="108" width="5" height="28" rx="2" fill="#475569"/>

          <!-- OLED Screen -->
          <rect x="60" y="63" width="80" height="84" rx="18" fill="#020617"/>
          
          <!-- Watch UI / Face -->
          <circle cx="100" cy="105" r="28" fill="none" stroke="#22c55e" stroke-width="3" stroke-dasharray="140 35"/>
          <circle cx="100" cy="105" r="22" fill="none" stroke="#eab308" stroke-width="3" stroke-dasharray="100 40"/>
          <circle cx="100" cy="105" r="16" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="70 40"/>
          
          <text x="100" y="98" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">10:09</text>
          <text x="100" y="112" font-family="sans-serif" font-size="7" font-weight="bold" fill="#38bdf8" text-anchor="middle">72 BPM</text>
        </g>
        '''
    elif "gshock" in kind:
        return f'''
        <g filter="url(#dropShadow)" transform="translate(60, 15)">
          <!-- Rugged Resin Strap -->
          <rect x="70" y="10" width="60" height="55" rx="4" fill="#18181b"/>
          <rect x="70" y="145" width="60" height="55" rx="4" fill="#18181b"/>
          
          <!-- Octagonal G-Shock Bezel -->
          <polygon points="68,55 132,55 152,75 152,135 132,155 68,155 48,135 48,75" fill="#27272a" stroke="#52525b" stroke-width="2.5"/>
          
          <!-- Knurled Push Buttons -->
          <rect x="42" y="75" width="6" height="12" rx="1" fill="#71717a"/>
          <rect x="42" y="120" width="6" height="12" rx="1" fill="#71717a"/>
          <rect x="152" y="75" width="6" height="12" rx="1" fill="#71717a"/>
          <rect x="152" y="120" width="6" height="12" rx="1" fill="#71717a"/>

          <!-- Dial Plate -->
          <circle cx="100" cy="105" r="38" fill="#09090b" stroke="#3f3f46" stroke-width="1.5"/>
          <!-- Analog Hands -->
          <line x1="100" y1="105" x2="100" y2="82" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="100" y1="105" x2="122" y2="114" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
          <circle cx="100" cy="105" r="3" fill="#ef4444"/>
          <!-- Digital Sub-Dial -->
          <rect x="80" y="118" width="40" height="12" rx="2" fill="#18181b"/>
          <text x="100" y="127" font-family="monospace" font-size="7" fill="#a1a1aa" text-anchor="middle">MO 16 10:08</text>
          <text x="100" y="78" font-family="sans-serif" font-size="6" font-weight="bold" fill="#ef4444" text-anchor="middle">G-SHOCK</text>
        </g>
        '''
    else: # Classic Watch
        return f'''
        <g filter="url(#dropShadow)" transform="translate(60, 15)">
          <!-- Leather Strap -->
          <rect x="74" y="10" width="52" height="55" rx="3" fill="#78350f" stroke="#451a03"/>
          <rect x="74" y="145" width="52" height="55" rx="3" fill="#78350f" stroke="#451a03"/>
          <!-- Polished Case -->
          <circle cx="100" cy="105" r="48" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2.5"/>
          <!-- Blue Sunray Dial -->
          <circle cx="100" cy="105" r="42" fill="#1e3a8a"/>
          <!-- Crown -->
          <rect x="148" y="100" width="6" height="10" rx="2" fill="#94a3b8"/>
          <!-- Roman Numerals -->
          <text x="100" y="76" font-family="serif" font-size="9" fill="#f8fafc" text-anchor="middle">XII</text>
          <text x="134" y="108" font-family="serif" font-size="8" fill="#f8fafc" text-anchor="middle">III</text>
          <text x="100" y="140" font-family="serif" font-size="8" fill="#f8fafc" text-anchor="middle">VI</text>
          <text x="68" y="108" font-family="serif" font-size="8" fill="#f8fafc" text-anchor="middle">IX</text>
          <!-- Elegant Hands -->
          <line x1="100" y1="105" x2="100" y2="80" stroke="#f8fafc" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="100" y1="105" x2="124" y2="100" stroke="#f8fafc" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="100" cy="105" r="2.5" fill="#f59e0b"/>
        </g>
        '''

def make_gadget_svg(kind="audio"):
    if kind == "airpods":
        return f'''
        <g filter="url(#dropShadow)" transform="translate(45, 20)">
          <!-- Charging Case -->
          <rect x="70" y="70" width="90" height="74" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
          <line x1="70" y1="92" x2="160" y2="92" stroke="#cbd5e1" stroke-width="1.2"/>
          <circle cx="115" cy="106" r="2" fill="#22c55e"/>
          
          <!-- Earbud Left -->
          <g transform="translate(50, 20)">
            <ellipse cx="25" cy="30" rx="14" ry="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
            <rect x="22" y="38" width="6" height="28" rx="3" fill="#ffffff" stroke="#cbd5e1"/>
            <ellipse cx="14" cy="30" rx="5" ry="8" fill="#94a3b8"/>
          </g>
          <!-- Earbud Right -->
          <g transform="translate(155, 20)">
            <ellipse cx="25" cy="30" rx="14" ry="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
            <rect x="22" y="38" width="6" height="28" rx="3" fill="#ffffff" stroke="#cbd5e1"/>
            <ellipse cx="36" cy="30" rx="5" ry="8" fill="#94a3b8"/>
          </g>
        </g>
        '''
    elif kind == "speaker":
        return f'''
        <g filter="url(#dropShadow)" transform="translate(30, 40)">
          <!-- Cylindrical Bluetooth Speaker Body -->
          <rect x="40" y="40" width="180" height="80" rx="28" fill="#18181b" stroke="#3b82f6" stroke-width="2"/>
          <!-- Passive Radiator Rings -->
          <ellipse cx="40" cy="80" rx="10" ry="38" fill="#27272a" stroke="#60a5fa" stroke-width="2"/>
          <ellipse cx="220" cy="80" rx="10" ry="38" fill="#27272a" stroke="#60a5fa" stroke-width="2"/>
          <!-- Mesh Pattern Texture -->
          <line x1="60" y1="42" x2="200" y2="42" stroke="#27272a" stroke-dasharray="3 3"/>
          <line x1="60" y1="118" x2="200" y2="118" stroke="#27272a" stroke-dasharray="3 3"/>
          <!-- Bold Silicone Logo Plate -->
          <rect x="100" y="65" width="60" height="30" rx="6" fill="#ef4444"/>
          <text x="130" y="86" font-family="sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">JBL</text>
        </g>
        '''
    elif kind == "powerbank":
        return f'''
        <g filter="url(#dropShadow)" transform="translate(60, 20)">
          <!-- Power Bank Brick -->
          <rect x="50" y="30" width="100" height="145" rx="12" fill="#18181b" stroke="#3f3f46" stroke-width="2"/>
          <!-- Top Port Plate -->
          <rect x="55" y="32" width="90" height="18" rx="4" fill="#09090b"/>
          <rect x="65" y="37" width="16" height="8" rx="1" fill="#f59e0b"/>
          <rect x="92" y="39" width="16" height="4" rx="2" fill="#3b82f6"/>
          <rect x="119" y="37" width="16" height="8" rx="1" fill="#f59e0b"/>
          <!-- 4 Battery Indicator LEDs -->
          <circle cx="85" cy="65" r="2" fill="#22c55e" filter="url(#softGlow)"/>
          <circle cx="95" cy="65" r="2" fill="#22c55e" filter="url(#softGlow)"/>
          <circle cx="105" cy="65" r="2" fill="#22c55e" filter="url(#softGlow)"/>
          <circle cx="115" cy="65" r="2" fill="#22c55e" filter="url(#softGlow)"/>
          <!-- Branding -->
          <text x="100" y="145" font-family="sans-serif" font-size="10" font-weight="bold" fill="#71717a" text-anchor="middle">20000 mAh</text>
          <text x="100" y="158" font-family="sans-serif" font-size="7" font-weight="bold" fill="#52525b" text-anchor="middle">22.5W FAST CHARGE</text>
        </g>
        '''
    elif kind == "charger":
        return f'''
        <g filter="url(#dropShadow)" transform="translate(70, 30)">
          <!-- Compact GaN Adapter -->
          <rect x="50" y="40" width="80" height="95" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
          <!-- Wall Prongs -->
          <rect x="130" y="60" width="20" height="6" rx="2" fill="#94a3b8"/>
          <rect x="130" y="90" width="20" height="6" rx="2" fill="#94a3b8"/>
          <!-- Output Ports on Front -->
          <rect x="62" y="55" width="22" height="7" rx="3" fill="#0284c7"/>
          <rect x="62" y="75" width="22" height="7" rx="3" fill="#0284c7"/>
          <rect x="62" y="95" width="22" height="11" rx="2" fill="#f59e0b"/>
          <text x="73" y="122" font-family="sans-serif" font-size="8" font-weight="900" fill="#0f172a" text-anchor="middle">65W GaN</text>
        </g>
        '''
    else: # Router
        return f'''
        <g filter="url(#dropShadow)" transform="translate(30, 20)">
          <!-- 4 Antennas -->
          <rect x="40" y="20" width="6" height="85" rx="3" fill="#18181b" transform="rotate(-15 43 105)"/>
          <rect x="100" y="15" width="6" height="90" rx="3" fill="#18181b"/>
          <rect x="160" y="15" width="6" height="90" rx="3" fill="#18181b"/>
          <rect x="220" y="20" width="6" height="85" rx="3" fill="#18181b" transform="rotate(15 223 105)"/>
          
          <!-- Router Main Body -->
          <polygon points="30,145 70,105 190,105 230,145 200,165 60,165" fill="#18181b" stroke="#3b82f6" stroke-width="1.8"/>
          <!-- Heat Vents -->
          <line x1="85" y1="120" x2="175" y2="120" stroke="#374151" stroke-width="2"/>
          <line x1="90" y1="130" x2="170" y2="130" stroke="#374151" stroke-width="2"/>
          <!-- Status LEDs -->
          <circle cx="115" cy="150" r="1.8" fill="#22c55e" filter="url(#softGlow)"/>
          <circle cx="125" cy="150" r="1.8" fill="#22c55e" filter="url(#softGlow)"/>
          <circle cx="135" cy="150" r="1.8" fill="#22c55e" filter="url(#softGlow)"/>
          <circle cx="145" cy="150" r="1.8" fill="#3b82f6" filter="url(#softGlow)"/>
        </g>
        '''

def make_gym_svg(kind="treadmill"):
    if kind == "treadmill":
        return f'''
        <g filter="url(#dropShadow)" transform="translate(35, 30)">
          <!-- Incline Running Deck -->
          <polygon points="25,145 220,135 235,160 15,170" fill="#18181b" stroke="#374151" stroke-width="2"/>
          <polygon points="35,147 210,138 220,156 28,165" fill="#09090b"/>
          <!-- Side Rails -->
          <line x1="45" y1="145" x2="95" y2="55" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
          <line x1="95" y1="55" x2="145" y2="55" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/>
          <!-- Console Display -->
          <rect x="110" y="35" width="45" height="30" rx="4" fill="#09090b" stroke="#38bdf8" stroke-width="1.5"/>
          <rect x="115" y="40" width="35" height="15" fill="#0284c7"/>
          <!-- Motor Hood at Front -->
          <rect x="195" y="115" width="45" height="38" rx="8" fill="#27272a" stroke="#ef4444" stroke-width="1.5"/>
        </g>
        '''
    elif kind == "dumbbells":
        return f'''
        <g filter="url(#dropShadow)" transform="translate(30, 30)">
          <!-- Dumbbell 1 -->
          <g transform="translate(10, 15) rotate(15 130 50)">
            <!-- Knurled Chrome Handle -->
            <rect x="65" y="45" width="90" height="12" rx="3" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
            <!-- Left Hex Head -->
            <polygon points="35,30 65,15 65,85 35,70 20,50" fill="#18181b" stroke="#3f3f46" stroke-width="2"/>
            <!-- Right Hex Head -->
            <polygon points="155,15 185,30 200,50 185,70 155,85" fill="#18181b" stroke="#3f3f46" stroke-width="2"/>
            <text x="50" y="54" font-family="sans-serif" font-size="8" font-weight="bold" fill="#ffffff">15</text>
            <text x="170" y="54" font-family="sans-serif" font-size="8" font-weight="bold" fill="#ffffff">15</text>
          </g>
        </g>
        '''
    elif kind == "bike":
        return f'''
        <g filter="url(#dropShadow)" transform="translate(35, 20)">
          <!-- Triangular Steel Frame -->
          <polygon points="65,150 140,55 185,150" fill="none" stroke="#ef4444" stroke-width="7" stroke-linejoin="round"/>
          <!-- Flywheel -->
          <circle cx="185" cy="150" r="38" fill="#18181b" stroke="#e2e8f0" stroke-width="6"/>
          <circle cx="185" cy="150" r="12" fill="#ef4444"/>
          <!-- Saddle Seat -->
          <line x1="85" y1="125" x2="70" y2="75" stroke="#475569" stroke-width="5"/>
          <path d="M50 75 Q70 65 95 75 Z" fill="#09090b"/>
          <!-- Handlebar -->
          <path d="M140 55 L150 35 L175 35" fill="none" stroke="#09090b" stroke-width="5" stroke-linecap="round"/>
          <!-- Pedals -->
          <circle cx="115" cy="150" r="10" fill="#334155"/>
          <line x1="115" y1="140" x2="115" y2="160" stroke="#94a3b8" stroke-width="4"/>
        </g>
        '''
    else: # Multi-station / Accessories
        return f'''
        <g filter="url(#dropShadow)" transform="translate(45, 20)">
          <!-- Weight Stack Tower -->
          <rect x="50" y="30" width="35" height="150" rx="3" fill="#18181b" stroke="#475569" stroke-width="2"/>
          <line x1="50" y1="50" x2="85" y2="50" stroke="#334155" stroke-width="2"/>
          <line x1="50" y1="70" x2="85" y2="70" stroke="#334155" stroke-width="2"/>
          <line x1="50" y1="90" x2="85" y2="90" stroke="#334155" stroke-width="2"/>
          <line x1="50" y1="110" x2="85" y2="110" stroke="#334155" stroke-width="2"/>
          <line x1="50" y1="130" x2="85" y2="130" stroke="#334155" stroke-width="2"/>
          <!-- Overhead Cable Pulley -->
          <path d="M68 30 L68 15 L145 15 L145 45" fill="none" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/>
          <!-- Workout Bench -->
          <rect x="90" y="115" width="95" height="14" rx="3" fill="#09090b" stroke="#ef4444" stroke-width="1.5"/>
          <line x1="135" y1="129" x2="135" y2="175" stroke="#475569" stroke-width="5"/>
          <line x1="175" y1="129" x2="175" y2="175" stroke="#475569" stroke-width="5"/>
        </g>
        '''

def make_suitcase_svg(is_set=False, is_aluminum=False):
    fill = "#0284c7" if not is_aluminum else "#94a3b8"
    stroke = "#0369a1" if not is_aluminum else "#475569"
    return f'''
    <g filter="url(#dropShadow)" transform="translate(50, 20)">
      <!-- Telescopic Handle -->
      <line x1="95" y1="10" x2="95" y2="45" stroke="#475569" stroke-width="3"/>
      <line x1="125" y1="10" x2="125" y2="45" stroke="#475569" stroke-width="3"/>
      <rect x="90" y="8" width="40" height="6" rx="2" fill="#1e293b"/>
      
      <!-- Suitcase Body -->
      <rect x="65" y="40" width="90" height="135" rx="14" fill="{fill}" stroke="{stroke}" stroke-width="2"/>
      <!-- Polycarbonate Grooves / Ribs -->
      <line x1="75" y1="65" x2="145" y2="65" stroke="#0c4a6e" stroke-width="2" opacity="0.4"/>
      <line x1="75" y1="85" x2="145" y2="85" stroke="#0c4a6e" stroke-width="2" opacity="0.4"/>
      <line x1="75" y1="105" x2="145" y2="105" stroke="#0c4a6e" stroke-width="2" opacity="0.4"/>
      <line x1="75" y1="125" x2="145" y2="125" stroke="#0c4a6e" stroke-width="2" opacity="0.4"/>
      <line x1="75" y1="145" x2="145" y2="145" stroke="#0c4a6e" stroke-width="2" opacity="0.4"/>

      <!-- Corner Protectors -->
      <path d="M65 52 A12 12 0 0 1 77 40 L65 40 Z" fill="#1e293b"/>
      <path d="M155 52 A12 12 0 0 0 143 40 L155 40 Z" fill="#1e293b"/>

      <!-- 360-Degree Double Spinner Wheels -->
      <circle cx="80" cy="180" r="6" fill="#09090b" stroke="#64748b" stroke-width="2"/>
      <circle cx="140" cy="180" r="6" fill="#09090b" stroke="#64748b" stroke-width="2"/>
    </g>
    '''

def make_appliance_svg(kind="front_load"):
    if kind == "front_load":
        return f'''
        <g filter="url(#dropShadow)" transform="translate(60, 20)">
          <!-- Front Load Cabinet -->
          <rect x="45" y="25" width="110" height="155" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
          <!-- Top Control Strip -->
          <rect x="45" y="25" width="110" height="32" rx="6" fill="#0f172a"/>
          <!-- Dial Knob -->
          <circle cx="100" cy="41" r="9" fill="#94a3b8" stroke="#f8fafc" stroke-width="1.5"/>
          <!-- LED Display -->
          <rect x="120" y="34" width="26" height="14" rx="2" fill="#0284c7"/>
          <text x="133" y="44" font-family="monospace" font-size="7" fill="#ffffff" text-anchor="middle">1400</text>
          
          <!-- Round Front Porthole Door -->
          <circle cx="100" cy="115" r="42" fill="#e2e8f0" stroke="#64748b" stroke-width="4"/>
          <!-- Tinted Glass Window -->
          <circle cx="100" cy="115" r="32" fill="#0369a1" opacity="0.65"/>
          <path d="M78 95 Q100 80 120 95" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.4"/>
        </g>
        '''
    else: # Top Load
        return f'''
        <g filter="url(#dropShadow)" transform="translate(60, 20)">
          <!-- Top Load Cabinet -->
          <rect x="45" y="30" width="110" height="150" rx="8" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>
          <!-- Tinted Glass Top Lid in perspective -->
          <polygon points="50,30 150,30 145,55 55,55" fill="#1e293b" stroke="#3b82f6"/>
          <!-- Control Panel -->
          <rect x="52" y="60" width="96" height="18" rx="3" fill="#0f172a"/>
          <circle cx="65" cy="69" r="4" fill="#38bdf8"/>
          <circle cx="80" cy="69" r="3" fill="#22c55e"/>
          <circle cx="95" cy="69" r="3" fill="#eab308"/>
          <text x="130" y="72" font-family="sans-serif" font-size="6" font-weight="bold" fill="#38bdf8">5 STAR</text>
          <!-- Front Body Recess Line -->
          <line x1="55" y1="90" x2="145" y2="90" stroke="#cbd5e1" stroke-width="2"/>
        </g>
        '''

def make_repair_svg(kind="bga"):
    if kind == "bga":
        return f'''
        <g filter="url(#dropShadow)" transform="translate(35, 20)">
          <!-- Motherboard PCB -->
          <rect x="25" y="80" width="190" height="95" rx="5" fill="#064e3b" stroke="#047857" stroke-width="2"/>
          <!-- Circuit Traces -->
          <path d="M40 90 L80 90 L100 110" stroke="#34d399" stroke-width="1.5" fill="none" opacity="0.7"/>
          <path d="M120 140 L160 140 L180 120" stroke="#34d399" stroke-width="1.5" fill="none" opacity="0.7"/>
          <!-- BGA Chip under repair -->
          <rect x="100" y="105" width="40" height="40" rx="2" fill="#111827" stroke="#fbbf24" stroke-width="1.5"/>
          <circle cx="120" cy="125" r="8" fill="#f59e0b" filter="url(#softGlow)" opacity="0.8"/>
          
          <!-- Stereo Microscope / Hot Air Wand -->
          <path d="M120 15 L120 75 L115 88 L125 88 Z" fill="#94a3b8" stroke="#334155" stroke-width="2"/>
          <!-- Hot Air Thermal Heat Cone -->
          <polygon points="115,88 125,88 135,108 105,108" fill="#ef4444" opacity="0.25" filter="url(#softGlow)"/>
        </g>
        '''
    elif kind == "screen":
        return f'''
        <g filter="url(#dropShadow)" transform="translate(35, 25)">
          <!-- Replacement Slim Laptop Screen Panel -->
          <rect x="35" y="30" width="200" height="120" rx="4" fill="#09090b" stroke="#38bdf8" stroke-width="2"/>
          <rect x="40" y="35" width="190" height="110" rx="2" fill="#0284c7" opacity="0.8"/>
          <!-- Peel-off Protective Film Tab -->
          <polygon points="215,30 235,30 235,50" fill="#f59e0b"/>
          <!-- 30-Pin Golden Ribbon Cable -->
          <path d="M135 150 L135 175 L155 175 L155 150" fill="#eab308" stroke="#ca8a04"/>
          <!-- Anti-Static Technician Badge -->
          <circle cx="70" cy="155" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
          <text x="70" y="159" font-family="sans-serif" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">100%</text>
        </g>
        '''
    else: # Thermal
        return f'''
        <g filter="url(#dropShadow)" transform="translate(30, 25)">
          <!-- Copper Heatpipe Assembly -->
          <path d="M40 70 Q130 50 200 70" fill="none" stroke="#d97706" stroke-width="8" stroke-linecap="round"/>
          <!-- Dual Blower Fans -->
          <circle cx="65" cy="110" r="32" fill="#18181b" stroke="#3b82f6" stroke-width="2"/>
          <circle cx="195" cy="110" r="32" fill="#18181b" stroke="#3b82f6" stroke-width="2"/>
          <!-- Arctic MX-4 Syringe -->
          <g transform="translate(110, 60) rotate(-35)">
            <rect x="0" y="0" width="55" height="14" rx="3" fill="#38bdf8" stroke="#0284c7"/>
            <rect x="55" y="4" width="20" height="6" fill="#94a3b8"/>
            <polygon points="75,5 85,7 75,9" fill="#94a3b8"/>
            <text x="25" y="10" font-family="sans-serif" font-size="6" font-weight="bold" fill="#ffffff">MX-4</text>
          </g>
        </g>
        '''

# Now let's map each product in products.json to its specific SVG
with open('products.json') as f:
    products = json.load(f)

for p in products:
    pid = p['id']
    cat = p['category']
    title = p['title'].lower()
    brand = (p.get('brand') or '').lower()
    
    svg_body = ""
    
    if cat == "laptops_used" or cat == "laptops_new":
        if "apple" in brand or "macbook" in title:
            is_m3 = "m3" in title
            svg_body = make_laptop_svg(brand, lid_color="#0f172a" if is_m3 else "#334155", base_color="#1e293b" if is_m3 else "#475569", screen_grad="screenGradMac", accent_logo="apple", is_notch=is_m3)
        elif "thinkpad" in title:
            svg_body = make_laptop_svg(brand, lid_color="#18181b", base_color="#27272a", screen_grad="screenGradWin", accent_logo="thinkpad")
        elif "hp" in brand:
            is_victus = "victus" in title
            svg_body = make_laptop_svg(brand, lid_color="#18181b" if is_victus else "#e2e8f0", base_color="#27272a" if is_victus else "#cbd5e1", screen_grad="screenGradGaming" if is_victus else "screenGradWin", accent_logo="victus" if is_victus else "hp")
        elif "dell" in brand:
            svg_body = make_laptop_svg(brand, lid_color="#334155", base_color="#475569", screen_grad="screenGradWin", accent_logo="dell")
        elif "asus" in brand:
            svg_body = make_laptop_svg(brand, lid_color="#18181b", base_color="#27272a", screen_grad="screenGradGaming")
        else:
            svg_body = make_laptop_svg(brand, lid_color="#1e293b", base_color="#334155", screen_grad="screenGradWin", accent_logo="lenovo")
            
    elif cat == "pc":
        if "apex" in title or "4070" in title:
            svg_body = make_pc_rig_svg(glow_color="#22d3ee", secondary_glow="#ec4899")
        elif "esports" in title or "3060" in title:
            svg_body = make_pc_rig_svg(glow_color="#a855f7", secondary_glow="#06b6d4")
        elif "workstation" in title or "4k" in title:
            svg_body = make_pc_rig_svg(glow_color="#eab308", secondary_glow="#3b82f6")
        else:
            svg_body = make_pc_rig_svg(glow_color="#3b82f6", secondary_glow="#10b981")
            
    elif cat == "pc_components":
        if "rtx" in title or "graphic" in title or "geforce" in title:
            svg_body = make_gpu_svg(p['title'], fans=2)
        elif "cabinet" in title or "case" in title:
            svg_body = make_pc_rig_svg(glow_color="#f59e0b", secondary_glow="#ef4444")
        elif "psu" in title or "power supply" in title:
            svg_body = '''
            <g filter="url(#dropShadow)" transform="translate(60, 30)">
              <rect x="40" y="30" width="130" height="110" rx="8" fill="#18181b" stroke="#eab308" stroke-width="2"/>
              <circle cx="105" cy="85" r="40" fill="#09090b" stroke="#374151" stroke-width="2"/>
              <text x="105" y="90" font-family="sans-serif" font-size="12" font-weight="900" fill="#eab308" text-anchor="middle">80 PLUS GOLD</text>
            </g>'''
        elif "motherboard" in title:
            svg_body = '''
            <g filter="url(#dropShadow)" transform="translate(45, 20)">
              <rect x="35" y="25" width="160" height="160" rx="6" fill="#18181b" stroke="#eab308" stroke-width="2"/>
              <rect x="85" y="60" width="45" height="45" rx="3" fill="#27272a" stroke="#cbd5e1" stroke-width="2"/>
              <rect x="145" y="50" width="8" height="65" rx="1" fill="#06b6d4"/>
              <rect x="157" y="50" width="8" height="65" rx="1" fill="#06b6d4"/>
              <rect x="55" y="130" width="115" height="10" rx="2" fill="#64748b"/>
              <text x="105" y="160" font-family="sans-serif" font-size="8" font-weight="bold" fill="#eab308">TUF GAMING DDR5</text>
            </g>'''
        elif "processor" in title or "cpu" in title:
            is_intel = "intel" in title
            svg_body = f'''
            <g filter="url(#dropShadow)" transform="translate(75, 30)">
              <rect x="30" y="25" width="110" height="110" rx="10" fill="{"#0284c7" if is_intel else "#ea580c"}" stroke="#ffffff" stroke-width="2"/>
              <rect x="45" y="40" width="80" height="80" rx="6" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
              <text x="85" y="85" font-family="sans-serif" font-size="12" font-weight="900" fill="#0f172a" text-anchor="middle">{"Intel Core" if is_intel else "AMD RYZEN"}</text>
            </g>'''
        elif "ram" in title or "ddr" in title:
            svg_body = '''
            <g filter="url(#dropShadow)" transform="translate(50, 40)">
              <rect x="25" y="30" width="170" height="36" rx="4" fill="#18181b" stroke="#eab308" stroke-width="1.5"/>
              <rect x="25" y="30" width="170" height="8" rx="2" fill="#ec4899" filter="url(#softGlow)"/>
              <rect x="35" y="66" width="150" height="6" fill="#eab308"/>
              <rect x="25" y="80" width="170" height="36" rx="4" fill="#18181b" stroke="#eab308" stroke-width="1.5"/>
              <rect x="25" y="80" width="170" height="8" rx="2" fill="#06b6d4" filter="url(#softGlow)"/>
              <rect x="35" y="116" width="150" height="6" fill="#eab308"/>
            </g>'''
        elif "ssd" in title:
            svg_body = '''
            <g filter="url(#dropShadow)" transform="translate(45, 60)">
              <rect x="30" y="30" width="170" height="42" rx="4" fill="#18181b" stroke="#3b82f6" stroke-width="2"/>
              <rect x="40" y="36" width="40" height="30" fill="#27272a"/>
              <rect x="90" y="36" width="40" height="30" fill="#27272a"/>
              <rect x="180" y="38" width="18" height="26" fill="#eab308"/>
              <text x="115" y="55" font-family="sans-serif" font-size="8" font-weight="bold" fill="#38bdf8" text-anchor="middle">CRUCIAL NVMe M.2 1TB</text>
            </g>'''
        elif "cooler" in title or "aio" in title:
            svg_body = '''
            <g filter="url(#dropShadow)" transform="translate(40, 30)">
              <rect x="20" y="25" width="160" height="60" rx="4" fill="#18181b" stroke="#3f3f46" stroke-width="2"/>
              <circle cx="60" cy="55" r="24" fill="#09090b" stroke="#06b6d4" stroke-width="2" filter="url(#softGlow)"/>
              <circle cx="140" cy="55" r="24" fill="#09090b" stroke="#a855f7" stroke-width="2" filter="url(#softGlow)"/>
              <circle cx="100" cy="130" r="22" fill="#111827" stroke="#06b6d4" stroke-width="2" filter="url(#softGlow)"/>
              <path d="M100 85 Q90 105 100 130" stroke="#374151" stroke-width="4" fill="none"/>
            </g>'''
        else:
            svg_body = make_gpu_svg(p['title'])
            
    elif cat == "pc_peripherals":
        if "mouse" in title:
            is_mx = "mx master" in title
            svg_body = f'''
            <g filter="url(#dropShadow)" transform="translate(95, 25)">
              <path d="M60 25 C30 25 20 60 20 100 C20 145 35 170 60 170 C85 170 100 145 100 100 C100 60 90 25 60 25 Z" fill="#18181b" stroke="{"#cbd5e1" if is_mx else "#38bdf8"}" stroke-width="2"/>
              <line x1="60" y1="25" x2="60" y2="75" stroke="#374151" stroke-width="2"/>
              <rect x="56" y="45" width="8" height="22" rx="4" fill="{"#cbd5e1" if is_mx else "#38bdf8"}"/>
              {"<path d='M30 140 Q60 160 90 140' stroke='#38bdf8' stroke-width='2.5' fill='none' filter='url(#softGlow)'/>" if not is_mx else ""}
            </g>'''
        elif "keyboard" in title:
            svg_body = '''
            <g filter="url(#dropShadow)" transform="translate(30, 45)">
              <rect x="20" y="30" width="220" height="85" rx="6" fill="#18181b" stroke="#ec4899" stroke-width="2"/>
              <line x1="30" y1="45" x2="230" y2="45" stroke="#ec4899" stroke-dasharray="8 4" stroke-width="4" filter="url(#softGlow)"/>
              <line x1="30" y1="60" x2="230" y2="60" stroke="#06b6d4" stroke-dasharray="8 4" stroke-width="4" filter="url(#softGlow)"/>
              <line x1="30" y1="75" x2="230" y2="75" stroke="#eab308" stroke-dasharray="8 4" stroke-width="4" filter="url(#softGlow)"/>
              <rect x="80" y="90" width="80" height="8" rx="2" fill="#38bdf8"/>
            </g>'''
        elif "mat" in title or "mousepad" in title:
            svg_body = '''
            <g filter="url(#dropShadow)" transform="translate(25, 45)">
              <rect x="20" y="30" width="230" height="90" rx="8" fill="#09090b" stroke="#06b6d4" stroke-width="3" filter="url(#softGlow)"/>
              <path d="M40 75 Q100 45 160 75 T230 65" stroke="#374151" stroke-width="2" fill="none"/>
              <path d="M40 90 Q120 60 180 90 T230 85" stroke="#374151" stroke-width="2" fill="none"/>
            </g>'''
        else: # Stand
            svg_body = '''
            <g filter="url(#dropShadow)" transform="translate(55, 30)">
              <polygon points="40,150 160,150 145,55 55,55" fill="none" stroke="#94a3b8" stroke-width="6" stroke-linejoin="round"/>
              <line x1="75" y1="70" x2="125" y2="70" stroke="#cbd5e1" stroke-width="4"/>
              <circle cx="100" cy="150" r="14" fill="#334155"/>
            </g>'''
            
    elif cat == "monitors":
        is_curved = "curved" in title or "odyssey" in title
        is_tv = "tv" in title
        svg_body = make_monitor_svg(is_curved=is_curved, is_tv=is_tv, brand=brand)
        
    elif cat == "watches":
        if "apple" in title:
            svg_body = make_watch_svg(kind="apple_ultra" if "ultra" in title else "apple_series")
        elif "g-shock" in title or "casio" in title:
            svg_body = make_watch_svg(kind="gshock")
        else:
            svg_body = make_watch_svg(kind="classic")
            
    elif cat == "gadgets":
        if "airpod" in title or "earbud" in title or "airdopes" in title:
            svg_body = make_gadget_svg("airpods")
        elif "flip" in title or "speaker" in title:
            svg_body = make_gadget_svg("speaker")
        elif "power bank" in title:
            svg_body = make_gadget_svg("powerbank")
        elif "charger" in title:
            svg_body = make_gadget_svg("charger")
        elif "router" in title:
            svg_body = make_gadget_svg("router")
        else:
            svg_body = make_gadget_svg("speaker")
            
    elif cat == "gym":
        if "treadmill" in title:
            svg_body = make_gym_svg("treadmill")
        elif "dumbbell" in title:
            svg_body = make_gym_svg("dumbbells")
        elif "bike" in title or "spin" in title:
            svg_body = make_gym_svg("bike")
        else:
            svg_body = make_gym_svg("multi")
            
    elif cat == "suitcases":
        svg_body = make_suitcase_svg(is_set="3-piece" in title, is_aluminum="aluminum" in title)
        
    elif cat == "appliances":
        svg_body = make_appliance_svg("front_load" if "front" in title else "top_load")
        
    elif cat == "repairs":
        if "motherboard" in title or "bga" in title:
            svg_body = make_repair_svg("bga")
        elif "screen" in title or "display" in title:
            svg_body = make_repair_svg("screen")
        else:
            svg_body = make_repair_svg("thermal")
            
    full_svg = wrap_svg(svg_body, title=p['title'])
    file_path = os.path.join(OUT_DIR, f"{pid}.svg")
    with open(file_path, "w", encoding="utf-8") as out_f:
        out_f.write(full_svg)

print(f"Generated {len(products)} SVG assets in {OUT_DIR}/ successfully!")
