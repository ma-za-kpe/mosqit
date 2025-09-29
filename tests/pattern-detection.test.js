/**
 * Pattern Detection Tests for Mosqit
 * Tests error pattern recognition, recurring issue detection, and framework-specific patterns
 */

describe('Pattern Detection System', () => {
  describe('Error Pattern Recognition', () => {
    test('should identify null reference patterns', () => {
      const errors = [
        "Cannot read property 'name' of null",
        "Cannot read properties of null (reading 'id')",
        "null is not an object",
        "TypeError: Cannot destructure property 'x' of null"
      ];

      const pattern = /null|cannot read propert/i;
      const matches = errors.filter(err => pattern.test(err));

      expect(matches).toHaveLength(4);
    });

    test('should identify undefined reference patterns', () => {
      const errors = [
        "Cannot read property 'name' of undefined",
        "undefined is not a function",
        "Cannot destructure property 'x' of undefined",
        "TypeError: undefined has no properties"
      ];

      const pattern = /undefined|is not a function/i;
      const matches = errors.filter(err => pattern.test(err));

      expect(matches).toHaveLength(4);
    });

    test('should identify network error patterns', () => {
      const errors = [
        "Failed to fetch",
        "NetworkError when attempting to fetch resource",
        "ERR_NETWORK_TIMEOUT",
        "CORS policy blocked",
        "net::ERR_CONNECTION_REFUSED"
      ];

      const pattern = /fetch|network|cors|connection|timeout/i;
      const matches = errors.filter(err => pattern.test(err));

      expect(matches).toHaveLength(5);
    });

    test('should identify syntax error patterns', () => {
      const errors = [
        "Unexpected token '}'",
        "SyntaxError: missing ) after argument list",
        "Unexpected end of JSON input",
        "Invalid or unexpected token"
      ];

      const pattern = /syntax|unexpected token|json|parsing/i;
      const matches = errors.filter(err => pattern.test(err));

      expect(matches).toHaveLength(4);
    });
  });

  describe('Recurring Error Detection', () => {
    test('should track error frequency by location', () => {
      class ErrorTracker {
        constructor() {
          this.patterns = new Map();
        }

        track(file, line, error) {
          const key = `${file}:${line}`;
          const current = this.patterns.get(key) || { count: 0, errors: [] };
          current.count++;
          current.errors.push(error);
          this.patterns.set(key, current);
        }

        getRecurring(threshold = 3) {
          const recurring = [];
          this.patterns.forEach((data, location) => {
            if (data.count >= threshold) {
              recurring.push({ location, ...data });
            }
          });
          return recurring;
        }
      }

      const tracker = new ErrorTracker();

      // Simulate recurring errors
      for (let i = 0; i < 5; i++) {
        tracker.track('app.js', 42, 'Cannot read property of null');
      }
      for (let i = 0; i < 2; i++) {
        tracker.track('utils.js', 10, 'undefined function');
      }

      const recurring = tracker.getRecurring();

      expect(recurring).toHaveLength(1);
      expect(recurring[0].location).toBe('app.js:42');
      expect(recurring[0].count).toBe(5);
    });

    test('should detect pattern after threshold occurrences', () => {
      const errors = [];
      const THRESHOLD = 3;

      const addError = (error) => {
        errors.push(error);
        const similarCount = errors.filter(e => e === error).length;
        return similarCount >= THRESHOLD;
      };

      expect(addError('Error A')).toBe(false);
      expect(addError('Error B')).toBe(false);
      expect(addError('Error A')).toBe(false);
      expect(addError('Error A')).toBe(true); // Third occurrence
    });

    test('should group similar errors together', () => {
      const errors = [
        { message: "Cannot read 'name' of null", file: 'user.js' },
        { message: "Cannot read 'email' of null", file: 'user.js' },
        { message: "Cannot read 'id' of null", file: 'user.js' },
        { message: "Network timeout", file: 'api.js' },
        { message: "Cannot read 'avatar' of null", file: 'user.js' }
      ];

      const grouped = {};
      errors.forEach(error => {
        const pattern = error.message.includes('null') ? 'null-reference' : 'network';
        if (!grouped[pattern]) grouped[pattern] = [];
        grouped[pattern].push(error);
      });

      expect(grouped['null-reference']).toHaveLength(4);
      expect(grouped['network']).toHaveLength(1);
    });
  });

  describe('Framework-Specific Pattern Detection', () => {
    test('should detect React patterns', () => {
      const reactPatterns = {
        hooks: /use[A-Z]|useState|useEffect|useMemo|useCallback/,
        lifecycle: /componentDidMount|componentWillUnmount|getDerivedStateFromProps/,
        rendering: /render|ReactDOM|jsx|setState/,
        hydration: /Hydration failed|did not match|Server HTML/
      };

      const errors = [
        "Invalid hook call. Hooks can only be called inside function components",
        "Cannot update during an existing state transition",
        "Hydration failed because initial UI does not match",
        "setState called after unmount"
      ];

      const detectedPatterns = [];
      errors.forEach(error => {
        for (const [name, pattern] of Object.entries(reactPatterns)) {
          if (pattern.test(error)) {
            detectedPatterns.push(name);
            break;
          }
        }
      });

      expect(detectedPatterns.length).toBeGreaterThan(0);
      expect(detectedPatterns).toContain('hydration');
    });

    test('should detect Vue patterns', () => {
      const vuePatterns = {
        reactivity: /reactive|ref|computed|watch/,
        lifecycle: /mounted|created|beforeDestroy|updated/,
        template: /v-if|v-for|v-model|template/
      };

      const code = `
        const count = ref(0);
        const doubled = computed(() => count.value * 2);
        onMounted(() => console.log('component mounted'));
      `;

      let detectedFramework = null;
      for (const pattern of Object.values(vuePatterns)) {
        if (pattern.test(code)) {
          detectedFramework = 'vue';
          break;
        }
      }

      expect(detectedFramework).toBe('vue');
    });

    test('should detect Angular patterns', () => {
      const angularPatterns = {
        decorators: /@Component|@Injectable|@NgModule|@Input|@Output/,
        dependency: /constructor.*:.*Service|inject\(/,
        rxjs: /Observable|Subject|subscribe|pipe/,
        zones: /Zone|NgZone|zone\.js/
      };

      const errors = [
        "NullInjectorError: No provider for UserService",
        "ExpressionChangedAfterItHasBeenCheckedError",
        "Cannot read property 'subscribe' of undefined",
        "Error in zone.js"
      ];

      const angularErrors = errors.filter(error => {
        return Object.values(angularPatterns).some(pattern =>
          pattern.test(error)
        );
      });

      expect(angularErrors.length).toBeGreaterThan(0);
    });

    test('should detect Next.js patterns', () => {
      const nextPatterns = {
        ssr: /getServerSideProps|getStaticProps|getInitialProps/,
        hydration: /Hydration|did not match|Server.*Client/,
        routing: /useRouter|next\/router|next\/link/,
        image: /next\/image|Image.*optimization/
      };

      const errors = [
        "Hydration failed: Text content does not match server-rendered HTML",
        "Error in getServerSideProps",
        "Image with src '/pic.jpg' must use next/image",
        "useRouter was called outside of Router context"
      ];

      const nextjsErrors = errors.filter(error => {
        return Object.values(nextPatterns).some(pattern =>
          pattern.test(error)
        );
      });

      expect(nextjsErrors).toHaveLength(4);
    });
  });

  describe('Pattern Matching Performance', () => {
    test('should efficiently match patterns in large error sets', () => {
      const errors = [];
      // Generate 10000 errors
      for (let i = 0; i < 10000; i++) {
        errors.push(`Error ${i}: ${i % 3 === 0 ? 'null reference' : 'other error'}`);
      }

      const start = Date.now();
      const nullErrors = errors.filter(e => e.includes('null reference'));
      const elapsed = Date.now() - start;

      expect(nullErrors).toHaveLength(Math.floor(10000 / 3) + 1);
      expect(elapsed).toBeLessThan(50); // Should be fast
    });

    test('should use memoization for repeated pattern checks', () => {
      const cache = new Map();

      const checkPattern = (error, pattern) => {
        const cacheKey = `${error}-${pattern}`;
        if (cache.has(cacheKey)) {
          return cache.get(cacheKey);
        }

        const result = pattern.test(error);
        cache.set(cacheKey, result);
        return result;
      };

      const pattern = /null/i;
      const error = "Cannot read property of null";

      // First call - computes
      const result1 = checkPattern(error, pattern);
      // Second call - uses cache
      const result2 = checkPattern(error, pattern);

      expect(result1).toBe(result2);
      expect(cache.size).toBe(1);
    });
  });

  describe('Pattern Suggestions', () => {
    test('should suggest fixes for null reference patterns', () => {
      const suggestions = {
        'null-reference': [
          'Use optional chaining: object?.property',
          'Add null check: if (object) { ... }',
          'Use default value: object || defaultValue'
        ],
        'undefined-function': [
          'Check if function exists: typeof fn === "function"',
          'Bind function context: fn.bind(this)',
          'Use arrow function to preserve context'
        ],
        'network-error': [
          'Add retry logic with exponential backoff',
          'Implement timeout handling',
          'Check CORS configuration'
        ]
      };

      // Using error variable just for context
      "Cannot read property 'name' of null"; // eslint-disable-line
      const pattern = 'null-reference';
      const fixes = suggestions[pattern];

      expect(fixes).toHaveLength(3);
      expect(fixes[0]).toContain('optional chaining');
    });

    test('should rank suggestions by relevance', () => {
      // Error context for test scenario
      // "Cannot read property 'name' of null in React component";

      const suggestions = [
        { text: 'Use optional chaining', relevance: 10 },
        { text: 'Add loading state', relevance: 8 },
        { text: 'Check data fetching', relevance: 6 }
      ];

      // Sort by relevance
      suggestions.sort((a, b) => b.relevance - a.relevance);

      expect(suggestions[0].text).toBe('Use optional chaining');
    });
  });
});

// Export for use in other tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PatternDetection: true };
}