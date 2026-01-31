const config = {
	darkMode: "class",
	theme: {
    	screen: {
    		'xs': '320px',
    		'sm': '640px',
    		'md': '768px',
    		'lg': '1024px',
    		'xl': '1280px',
    		'2xl': '1536px',
    		'3xl': '1920px',
    		'4xl': '2560px',
    	},
    	extend: {
    		backgroundImage: {
    			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
    			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		fontSize: {
    			'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
    			'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
    			'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
    			'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
    			'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
    			'fluid-2xl': 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
    			'fluid-3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem)',
    			'fluid-4xl': 'clamp(2.25rem, 1.75rem + 2.5vw, 3rem)',
    			'fluid-5xl': 'clamp(3rem, 2rem + 5vw, 5rem)',
    			'fluid-6xl': 'clamp(3.75rem, 2.5rem + 6.25vw, 6rem)',
    			'fluid-7xl': 'clamp(4.5rem, 3rem + 7.5vw, 7rem)',
    			'fluid-8xl': 'clamp(6rem, 4rem + 10vw, 10rem)',
    			'fluid-9xl': 'clamp(7.5rem, 5rem + 12.5vw, 12rem)',
    		},
    		spacing: {
    			'fluid-xs': 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)',
    			'fluid-sm': 'clamp(1rem, 0.8rem + 1vw, 1.5rem)',
    			'fluid-md': 'clamp(1.5rem, 1rem + 2vw, 3rem)',
    			'fluid-lg': 'clamp(2rem, 1.5rem + 2.5vw, 4rem)',
    			'fluid-xl': 'clamp(3rem, 2rem + 5vw, 6rem)',
    			'fluid-2xl': 'clamp(4rem, 2.5rem + 7.5vw, 8rem)',
    			'18': '4.5rem',
    			'128': '32rem',
    		},
    		maxWidth: {
    			'xs': '20rem',
    			'container-sm': '640px',
    			'container-md': '768px',
    			'container-lg': '1024px',
    			'container-xl': '1280px',
    			'container-2xl': '1536px',
    		},
    		gridTemplateColumns: {
    			'13': 'repeat(13, minmax(0, 1fr))',
    			'14': 'repeat(14, minmax(0, 1fr))',
    			'15': 'repeat(15, minmax(0, 1fr))',
    			'16': 'repeat(16, minmax(0, 1fr))',
    		},
    		zIndex: {
    			'60': '60',
    			'70': '70',
    			'80': '80',
    			'90': '90',
    			'100': '100',
    			'9999': '9999',
    		},
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			},
    			'scanner-smooth': {
    				'0%': {
    					top: '0%'
    				},
    				'50%': {
    					top: 'calc(100% - 3px)'
    				},
    				'50.001%': {
    					top: 'calc(100% - 3px)'
    				},
    				'100%': {
    					top: '0%'
    				}
    			},
    			'glow-subtle': {
    				'0%': {
    					opacity: '0.5'
    				},
    				'50%': {
    					opacity: '0.7'
    				},
    				'100%': {
    					opacity: '0.5'
    				}
    			},
    			'glow-success': {
    				'0%': {
    					opacity: '0.5'
    				},
    				'50%': {
    					opacity: '0.8'
    				},
    				'100%': {
    					opacity: '0.5'
    				}
    			},
    			'success-pulse': {
    				'0%': {
    					opacity: '0'
    				},
    				'50%': {
    					opacity: '1'
    				},
    				'100%': {
    					opacity: '0'
    				}
    			},
    			'success-sweep': {
    				'0%': {
    					transform: 'translateX(-100%)'
    				},
    				'100%': {
    					transform: 'translateX(100%)'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			'scanner-smooth': 'scanner-smooth 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    			'glow-subtle': 'glow-subtle 3s ease-in-out infinite',
    			'glow-success': 'glow-success 2s ease-in-out infinite',
    			'success-pulse': 'success-pulse 3s ease-in-out infinite',
    			'success-sweep': 'success-sweep 1.5s ease-in-out forwards'
    		},
    		typography: {
    			DEFAULT: {
    				css: {
    					'code::before': {
    						content: '""'
    					},
    					'code::after': {
    						content: '""'
    					},
    					table: {
    						width: '100%',
    						marginTop: '1.5rem',
    						marginBottom: '1.5rem',
    						borderCollapse: 'collapse',
    						fontSize: '0.875rem',
    						lineHeight: '1.25rem',
    						border: '1px solid var(--tw-prose-td-borders)'
    					},
    					thead: {
    						backgroundColor: 'var(--tw-prose-th-borders)',
    						borderWidth: '1px',
    						borderStyle: 'solid',
    						borderColor: 'var(--tw-prose-td-borders)'
    					},
    					'thead th': {
    						padding: '1rem',
    						fontWeight: '500',
    						textAlign: 'left',
    						backgroundColor: 'var(--tw-prose-th-borders)'
    					},
    					'tbody tr': {
    						borderBottomWidth: '1px',
    						borderBottomStyle: 'solid',
    						borderBottomColor: 'var(--tw-prose-td-borders)'
    					},
    					'tbody td': {
    						padding: '1rem',
    						borderWidth: '1px',
    						borderStyle: 'solid',
    						borderColor: 'var(--tw-prose-td-borders)'
    					}
    				}
    			}
    		}
    	}
    },
};
export default config;
