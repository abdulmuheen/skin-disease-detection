#!/usr/bin/env python3
"""
DermaScan AI Backend API Testing
Tests all backend endpoints including health check and skin analysis
"""

import requests
import sys
import base64
import json
from datetime import datetime
from io import BytesIO
from PIL import Image

class DermaScanAPITester:
    def __init__(self, base_url="https://derma-classifier.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def create_test_image_base64(self):
        """Create a simple test image in base64 format"""
        # Create a simple test image with some visual features
        img = Image.new('RGB', (200, 200), color='white')
        
        # Add some visual features (colored rectangles to simulate skin texture)
        from PIL import ImageDraw
        draw = ImageDraw.Draw(img)
        
        # Add some colored patches to simulate skin variations
        draw.rectangle([50, 50, 100, 100], fill='#F4C2A1')  # Skin tone
        draw.rectangle([120, 80, 150, 120], fill='#E8A87C')  # Slightly different tone
        draw.ellipse([70, 130, 90, 150], fill='#D2691E')     # Small spot
        
        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format='JPEG')
        img_data = buffer.getvalue()
        return base64.b64encode(img_data).decode('utf-8')

    def test_health_endpoint(self):
        """Test the health check endpoint"""
        try:
            response = requests.get(f"{self.api_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_test("Health Check", True)
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "DermaScan AI" in data.get("message", ""):
                    self.log_test("Root Endpoint", True)
                    return True
                else:
                    self.log_test("Root Endpoint", False, f"Unexpected message: {data}")
                    return False
            else:
                self.log_test("Root Endpoint", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_analyze_endpoint(self):
        """Test the skin analysis endpoint"""
        try:
            # Create test image
            test_image_b64 = self.create_test_image_base64()
            
            payload = {
                "image_base64": test_image_b64,
                "mime_type": "image/jpeg"
            }
            
            headers = {'Content-Type': 'application/json'}
            
            print("🔍 Testing analyze endpoint with test image...")
            response = requests.post(
                f"{self.api_url}/analyze", 
                json=payload, 
                headers=headers, 
                timeout=30  # Longer timeout for AI analysis
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate required fields
                required_fields = [
                    'detected_condition', 'condition_name', 'confidence_score',
                    'description', 'severity', 'treatments', 'precautions',
                    'analysis_notes', 'disclaimer'
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Analyze Endpoint", False, f"Missing fields: {missing_fields}")
                    return False
                
                # Validate data types and ranges
                if not isinstance(data['confidence_score'], (int, float)) or not (0 <= data['confidence_score'] <= 1):
                    self.log_test("Analyze Endpoint", False, "Invalid confidence_score")
                    return False
                
                if not isinstance(data['treatments'], list) or len(data['treatments']) == 0:
                    self.log_test("Analyze Endpoint", False, "Invalid treatments list")
                    return False
                
                if not isinstance(data['precautions'], list) or len(data['precautions']) == 0:
                    self.log_test("Analyze Endpoint", False, "Invalid precautions list")
                    return False
                
                print(f"   📊 Detected: {data['condition_name']}")
                print(f"   📈 Confidence: {data['confidence_score']:.0%}")
                print(f"   ⚠️  Severity: {data['severity']}")
                
                self.log_test("Analyze Endpoint", True, f"Detected: {data['condition_name']}")
                return True
                
            else:
                error_msg = f"Status code: {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f", Error: {error_data}"
                except:
                    error_msg += f", Response: {response.text[:200]}"
                
                self.log_test("Analyze Endpoint", False, error_msg)
                return False
                
        except Exception as e:
            self.log_test("Analyze Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_analyze_with_invalid_data(self):
        """Test analyze endpoint with invalid data"""
        try:
            # Test with invalid base64
            payload = {
                "image_base64": "invalid_base64_data",
                "mime_type": "image/jpeg"
            }
            
            headers = {'Content-Type': 'application/json'}
            response = requests.post(f"{self.api_url}/analyze", json=payload, headers=headers, timeout=10)
            
            if response.status_code == 400:
                self.log_test("Analyze Invalid Data", True, "Correctly rejected invalid base64")
                return True
            else:
                self.log_test("Analyze Invalid Data", False, f"Expected 400, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Analyze Invalid Data", False, f"Exception: {str(e)}")
            return False

    def test_conditions_endpoint(self):
        """Test the conditions information endpoint"""
        try:
            response = requests.get(f"{self.api_url}/conditions", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if we have expected conditions
                expected_conditions = ['acne', 'eczema', 'psoriasis', 'melanoma', 'healthy_skin']
                found_conditions = [cond for cond in expected_conditions if cond in data]
                
                if len(found_conditions) >= 3:  # At least 3 conditions should be present
                    self.log_test("Conditions Endpoint", True, f"Found {len(data)} conditions")
                    return True
                else:
                    self.log_test("Conditions Endpoint", False, f"Only found {len(found_conditions)} expected conditions")
                    return False
            else:
                self.log_test("Conditions Endpoint", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Conditions Endpoint", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting DermaScan AI Backend Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 50)
        
        # Run tests in order
        tests = [
            self.test_health_endpoint,
            self.test_root_endpoint,
            self.test_conditions_endpoint,
            self.test_analyze_endpoint,
            self.test_analyze_with_invalid_data
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ Test {test.__name__} crashed: {str(e)}")
                self.tests_run += 1
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

    def get_test_results(self):
        """Return detailed test results"""
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "test_details": self.test_results
        }

def main():
    """Main test execution"""
    tester = DermaScanAPITester()
    success = tester.run_all_tests()
    
    # Save results
    results = tester.get_test_results()
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())